'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function PublishComposerPage() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<string[]>([])
  const [generatingCaption, setGeneratingCaption] = useState(false)

  const handleTogglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter(item => item !== p))
    } else {
      setSelectedPlatforms([...selectedPlatforms, p])
    }
  }

  const handleGenerateAICaption = () => {
    setGeneratingCaption(true)
    toast.loading('Gemini AI generating caption variants...', { duration: 2500 })
    setTimeout(() => {
      setContent(prev => prev + '\n🌟 Level up your business operations with our automated CRM workflows! Fast, scalable, and optimized. Try it today!')
      setGeneratingCaption(false)
      toast.success('AI Caption generated!')
    }, 2500)
  }

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform.')
      return
    }
    if (!content.trim()) {
      toast.error('Post content cannot be empty.')
      return
    }
    toast.success('Post submitted to approval queue workflow!')
  }

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Campaign Composer</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Compose outbound content, select target pages, upload visual mockups, and schedule delivery times.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Publisher Editor form */}
        <form onSubmit={handlePublish} className="md:col-span-2 rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">📝 Compose Content</h3>

          {/* Platform selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Target Channels</span>
            <div className="flex gap-3">
              {['Facebook Page', 'Instagram Feed', 'WhatsApp Broadcast'].map(platform => {
                const isSelected = selectedPlatforms.includes(platform)
                return (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => handleTogglePlatform(platform)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${
                      isSelected 
                        ? 'border-[#E3B859] bg-[#E3B859]/10 text-[#E3B859]' 
                        : 'border-[#2D2D30] bg-[#141416] text-gray-400 hover:text-white'
                    }`}
                  >
                    {platform}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Message Copy</span>
              <button
                type="button"
                onClick={handleGenerateAICaption}
                disabled={generatingCaption}
                className="text-[#E3B859] hover:text-[#d4ac50] text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
              >
                ✨ Generate AI Caption
              </button>
            </div>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#141416] border border-[#2D2D30] focus:border-[#E3B859] rounded-xl px-4 py-3 text-xs focus:outline-none transition-colors resize-none"
              placeholder="What do you want to share today? Reference company pitch or offer details..."
            />
          </div>

          {/* Media attachment placeholder */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Media Attachments</span>
            <div className="border-2 border-dashed border-[#2D2D30] hover:border-gray-500 rounded-xl p-6 text-center cursor-pointer bg-[#141416] transition-colors">
              <span className="text-2xl block mb-2">🖼️</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Drag & drop files or click to upload</span>
              <span className="text-[9px] text-gray-500 mt-1 block uppercase tracking-wider">PNG, JPEG, MP4 up to 50MB</span>
            </div>
          </div>

          {/* Publisher Buttons */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" className="bg-[#141416] border border-[#2D2D30] rounded-lg px-3 py-1.5 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Time</label>
                <input type="time" className="bg-[#141416] border border-[#2D2D30] rounded-lg px-3 py-1.5 text-xs focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-xl border border-[#2D2D30] hover:bg-gray-800 text-xs font-bold uppercase tracking-wider px-5 py-3 text-gray-300 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#E3B859] hover:bg-[#d4ac50] text-[#141416] text-xs font-bold uppercase tracking-wider px-6 py-3 transition-colors shadow-md"
              >
                Schedule Post
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Platform Preview Simulator */}
        <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">📱 Live Feed Preview</h3>
          
          <div className="bg-[#141416] border border-[#2D2D30]/60 rounded-xl p-4 space-y-3.5 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-[#E3B859] p-0.5">
                <div className="w-full h-full rounded-full bg-[#18181A] flex items-center justify-center font-black text-white text-[10px]">
                  ZP
                </div>
              </div>
              <div>
                <span className="font-bold text-white block">Zarss Dev Singapore</span>
                <span className="text-[10px] text-gray-500">Sponsored • Instagram Feed</span>
              </div>
            </div>

            <p className="text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
              {content || 'Your composed copy text will dynamically simulate here...'}
            </p>

            <div className="w-full h-40 bg-gray-900 border border-[#2D2D30]/60 rounded-xl flex items-center justify-center text-gray-500 text-xs font-bold uppercase tracking-wider select-none">
              Visual media mockup preview
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 pt-2 border-t border-[#2D2D30]/30 uppercase tracking-wider font-bold">
              <span>❤️ Like</span>
              <span>💬 Comment</span>
              <span>📤 Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
