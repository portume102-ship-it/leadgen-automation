// backend/scripts/verify_intelligence_db.js
// Integration test script to verify all 10 tables, JSDoc repositories, logging, transactions, and error handler.

const db = require('../database/db');
const { DatabaseError } = require('../database/dbErrorHandler');
const businessRepo = require('../repositories/businessRepository');
const conversationRepo = require('../repositories/conversationRepository');
const memoryRepo = require('../repositories/memoryRepository');
const researchRepo = require('../repositories/researchRepository');
const followupRepo = require('../repositories/followupRepository');
const logger = require('../worker/logger');

async function run() {
  logger.info('=== STARTING INTEGRATION VERIFICATION SUITE ===');

  let dummyLeadId = null;

  try {
    // 1. Insert/find a dummy lead in the existing leads table
    logger.info('1. Creating a dummy lead in existing table...');
    const leadInsertRes = await db.query(`
      INSERT INTO leads (name, email, phone, city, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, ['Test Business Corp', 'test@corp.com', '+919999999999', 'Mumbai', 'Test notes'], 'LeadsCheck', 'createLead');
    
    dummyLeadId = leadInsertRes.rows[0].id;
    logger.info(`✓ Lead created with ID: ${dummyLeadId}`);

    // 2. Test Business Profile Creation
    logger.info('\n2. Testing businessRepository.create...');
    const profile = await businessRepo.create({
      lead_id: dummyLeadId,
      business_name: 'Test Business Corp',
      industry: 'Software SaaS',
      website: 'https://testcorp.com',
      email: 'sales@testcorp.com',
      phone: '+919999999999',
      address: '123 Tech Park, Mumbai',
      social_links: { facebook: 'fb.com/testcorp', twitter: 'x.com/testcorp' }
    });
    logger.info(`✓ Business profile created: ${JSON.stringify(profile)}`);

    // 3. Test Business Profile Read by ID and by Lead ID
    logger.info('\n3. Testing businessRepository.findById & findByLeadId...');
    const foundProfile = await businessRepo.findById(profile.id);
    const foundByLead = await businessRepo.findByLeadId(dummyLeadId);
    if (foundProfile.id === profile.id && foundByLead.id === profile.id) {
      logger.info('✓ Profile retrieval verified successfully.');
    } else {
      throw new Error('Profile retrieval mismatch.');
    }

    // 4. Test Unique Constraint Translation
    logger.info('\n4. Testing unique constraint error mapping (dbErrorHandler)...');
    try {
      await businessRepo.create({
        lead_id: dummyLeadId, // unique key violation
        business_name: 'Duplicate Inc'
      });
      throw new Error('Fail: Duplicate lead_id profile should have thrown a unique violation!');
    } catch (err) {
      if (err instanceof DatabaseError && err.statusCode === 409) {
        logger.info(`✓ Expected duplicate exception caught & translated: HTTP ${err.statusCode} - ${err.message}`);
      } else {
        throw err;
      }
    }

    // 5. Test Business Memory & Observations
    logger.info('\n5. Testing Memory and Observations...');
    const memory = await memoryRepo.create({
      business_id: profile.id,
      key_insights: ['Looking to scale outreach', 'Budget is high'],
      preferences: { preferred_channel: 'whatsapp' },
      objections_raised: ['Price concern'],
      summary: 'High value SaaS lead'
    });
    logger.info(`✓ Memory instance created: ${memory.summary}`);

    const observation = await memoryRepo.createObservation({
      business_id: profile.id,
      observation_type: 'tech_stack',
      content: 'Uses Shopify and Google Analytics',
      confidence_score: 0.95,
      source: 'crawled_meta'
    });
    logger.info(`✓ Observation created: ${observation.observation_type} - ${observation.content}`);

    const observations = await memoryRepo.getObservationsByLeadId(dummyLeadId);
    logger.info(`✓ Found ${observations.length} observations by lead ID`);

    // 6. Test Business Research
    logger.info('\n6. Testing Business Research...');
    const research = await researchRepo.create({
      business_id: profile.id,
      research_topic: 'Competitor Analysis',
      findings: { competitor_name: 'Huge Corp Inc' },
      summary: 'Strong digital footprint, active ads.',
      source_urls: ['https://competitor.com']
    });
    logger.info(`✓ Research created: ${research.research_topic} - ${research.summary}`);

    // 7. Test Transaction Block & Rollback
    logger.info('\n7. Testing atomic database transactions & rollback...');
    
    // Create state & message inside a transaction successfully
    const transactionResult = await db.transaction(async (tx) => {
      const state = await conversationRepo.create({
        business_id: profile.id,
        current_stage: 'outreach_started',
        next_action: 'Send intro whatsapp'
      }, tx);

      const msg = await conversationRepo.createMessage({
        conversation_state_id: state.id,
        direction: 'outbound',
        channel: 'whatsapp',
        body: 'Hello, welcome to our service!'
      }, tx);

      return { state, msg };
    }, 'IntegrationTestTransaction');
    
    logger.info(`✓ Transaction completed successfully. State stage: ${transactionResult.state.current_stage}`);

    // Verify transaction rollback works by forcing a check constraint violation (invalid channel type)
    logger.info('Testing rollback inside a transaction block...');
    try {
      await db.transaction(async (tx) => {
        // This query works
        await conversationRepo.update(transactionResult.state.id, {
          current_stage: 'demo_scheduled'
        }, tx);

        // This query will crash (invalid check constraint on direction)
        await conversationRepo.createMessage({
          conversation_state_id: transactionResult.state.id,
          direction: 'INVALID_DIRECTION_TYPE', // should fail CHECK constraint
          channel: 'whatsapp',
          body: 'This should fail'
        }, tx);
      }, 'IntegrationRollbackTest');
      
      throw new Error('Fail: Transaction did not roll back!');
    } catch (err) {
      logger.info('✓ Transaction rolled back successfully as expected.');
      
      // Verify that the first query ('demo_scheduled') was indeed rolled back
      const verifiedState = await conversationRepo.findById(transactionResult.state.id);
      if (verifiedState.current_stage === 'outreach_started') {
        logger.info('✓ Confirmed: Database state remained unchanged ("outreach_started"). Rollback verified!');
      } else {
        throw new Error(`Rollback failed! State is currently "${verifiedState.current_stage}"`);
      }
    }

    // 8. Test Followups and Meetings
    logger.info('\n8. Testing Followups and Meetings...');
    const followup = await followupRepo.create({
      business_id: profile.id,
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
      reason: 'Call prospect for onboarding',
      payload: { call_duration: 15 }
    });
    logger.info(`✓ Followup queued: ${followup.reason}`);

    const meeting = await followupRepo.createMeeting({
      business_id: profile.id,
      scheduled_at: new Date().toISOString(),
      duration_minutes: 30,
      status: 'scheduled',
      notes: 'Initial intro call notes.'
    });
    logger.info(`✓ Meeting history logged: ${meeting.notes}`);

  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, '❌ Integration verification failed!');
    process.exit(1);
  } finally {
    // Cleanup verification data
    if (dummyLeadId) {
      logger.info('\nCleaning up verification records...');
      try {
        await db.query('DELETE FROM leads WHERE id = $1', [dummyLeadId], 'Cleanup', 'deleteLead');
        logger.info('✓ Verification records deleted successfully (cascaded to all intelligence tables).');
      } catch (err) {
        logger.error('Failed to clean up verification records:', err.message);
      }
    }
    logger.info('=== INTEGRATION VERIFICATION SUITE COMPLETE ===');
    process.exit(0);
  }
}

run();
