import { Smartphone, X, Gift, Star } from "lucide-react";
import { useRef, useEffect } from "react";
import { ComponentRenderer } from "./BottomSheetV2/components/Canvas/ComponentRenderer";
import { calculateRequiredHeight } from "./BottomSheetV2/utils/heightCalculator";
import type { Component } from "./BottomSheetV2/core/types";

// Helper function to extract YouTube video ID
const extractYouTubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

interface NudgeConfig {
  type: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  buttonText?: string;
  position?: string;
  title?: string;
  imageUrl?: string;
  secondaryButtonText?: string;
  rewardAmount?: string;
  variant?: string;
  [key: string]: any;
}

interface MobilePreviewProps {
  config: NudgeConfig;
}

export const MobilePreview = ({ config }: MobilePreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force video to play when mounted or config changes
  useEffect(() => {
    if (videoRef.current && config.videoUrl) {
      // Small delay to ensure video is mounted
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(err => {
          console.log('Autoplay failed:', err);
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [config.videoUrl]);

  const renderNudge = () => {
    switch (config.type) {
      case "modal":
        return (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
            <div
              className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl relative animate-in zoom-in-95 duration-300"
              style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
            >
              {config.showCloseButton !== false && (
                <button className="absolute top-3 right-3 opacity-60 hover:opacity-100">
                  <X className="h-4 w-4" />
                </button>
              )}
              {config.title && (
                <h3 className="text-lg font-bold mb-2">{config.title}</h3>
              )}
              <p className="text-sm mb-4">{config.text}</p>
              <button
                className="w-full py-2.5 rounded-lg font-medium text-sm"
                style={{
                  backgroundColor: config.buttonColor || config.textColor,
                  color: config.buttonColor ? "#fff" : config.backgroundColor,
                }}
              >
                {config.buttonText || "OK"}
              </button>
              {config.secondaryButtonText && (
                <button className="w-full py-2 mt-2 text-sm opacity-70">
                  {config.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        );

      case "banner":
        return (
          <div
            className={`absolute left-0 right-0 ${
              config.position === "bottom" ? "bottom-4" : "top-12"
            } mx-0 shadow-lg p-4 animate-in ${
              config.position === "bottom" ? "slide-in-from-bottom-5" : "slide-in-from-top-5"
            } duration-500`}
            style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg">🔔</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                {config.title && (
                  <p className="text-xs font-semibold mb-0.5">{config.title}</p>
                )}
                <p className="text-xs opacity-90 line-clamp-1">{config.text}</p>
              </div>
              {config.buttonText && (
                <button
                  className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: config.textColor,
                    color: config.backgroundColor,
                  }}
                >
                  {config.buttonText}
                </button>
              )}
              <button className="flex-shrink-0 opacity-60">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        );

      case "bottom_sheet":
        // Get all bottom sheet customization values with defaults
        const sheetType = config.sheetType || 'draggable';
        const sheetInitialHeight = config.initialHeight === 'peek' ? 30 : 
                                   config.initialHeight === 'half' ? 50 : 
                                   config.initialHeight === 'full' ? 90 : 50;
        const sheetCornerRadius = config.cornerRadius || 20;
        const showHandleBar = config.handleBarVisible !== false;
        const handleBarColor = config.handleBarColor || '#CCCCCC';
        const sheetBackgroundColor = config.backgroundColor || '#FFFFFF';
        const contentType = config.contentType || 'announcement';
        const overlayOpacity = (config.backgroundDimOpacity || 0.5) * 100;
        
        // Check if using visual builder (components array exists)
        const hasComponents = config.components && Array.isArray(config.components) && config.components.length > 0;
        
        // ✅ V2 IMPROVEMENT: Use shared height calculator
        // This ensures perfect sync between Canvas and Preview
        const calculatedContentHeight = hasComponents 
          ? calculateRequiredHeight(config.components as Component[])
          : 50;
        
        // ✅ FIX: Calculate proper height for simple mode
        // For simple mode, use a reasonable default height (350px) or config height
        const contentHeight = hasComponents 
          ? (config.canvasHeight || Math.max(calculatedContentHeight, 80))
          : (config.canvasHeight || 350); // Default 350px for simple mode
        
        // ✅ FIX: Use 375px width for builder mode (canvas width)
        // Simple mode uses full width, builder mode matches canvas
        const contentWidth = hasComponents ? 375 : undefined;
        
        return (
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
          >
            <div
              className={`absolute bottom-0 shadow-2xl animate-in slide-in-from-bottom-10 ${!contentWidth ? 'left-0 right-0' : ''}`}
              style={{ 
                backgroundColor: sheetBackgroundColor,
                color: config.textColor || '#1F2937',
                borderTopLeftRadius: `${sheetCornerRadius}px`,
                borderTopRightRadius: `${sheetCornerRadius}px`,
                height: `${contentHeight}px`,
                maxHeight: `${contentHeight}px`,
                width: contentWidth ? `${contentWidth}px` : '100%',
                left: contentWidth ? '50%' : undefined,
                transform: contentWidth ? 'translateX(-50%)' : undefined,
                boxShadow: `0 -8px 32px rgba(0, 0, 0, 0.15)`,
                animationDuration: `${config.animationDuration || 350}ms`
              }}
            >
              {/* Handle Bar */}
              {showHandleBar && (
                <div className="flex justify-center pt-3 pb-2">
                  <div 
                    className="rounded-full" 
                    style={{ 
                      backgroundColor: handleBarColor,
                      width: '40px',
                      height: '4px'
                    }}
                  />
                </div>
              )}
              
              {/* Content Area - Visual Builder or Simple Mode */}
              {hasComponents ? (
                /* ✅ V2 IMPROVEMENT: Use shared ComponentRenderer */
                <div className="relative" style={{ 
                  minHeight: '200px', 
                  padding: 0,
                  width: '375px', // Match canvas width
                  margin: '0 auto' // Center the content
                }}>
                  {config.components
                    .filter((comp: any) => comp.visible !== false)
                    .sort((a: any, b: any) => (a.position?.zIndex || 0) - (b.position?.zIndex || 0))
                    .map((comp: any) => (
                      <div
                        key={comp.id}
                        style={{
                          position: 'absolute',
                          left: comp.position?.x || 0,
                          top: comp.position?.y || 0,
                          width: typeof comp.position?.width === 'number' ? `${comp.position.width}px` : comp.position?.width || 'auto',
                          height: typeof comp.position?.height === 'number' ? `${comp.position.height}px` : comp.position?.height || 'auto',
                          zIndex: comp.position?.zIndex || 1,
                          transform: `rotate(${comp.position?.rotation || 0}deg)`,
                        }}
                      >
                        <ComponentRenderer component={comp as Component} />
                      </div>
                    ))}
                </div>
              ) : (
                /* Simple Mode - Traditional Content */
                <div className="space-y-4 p-6 overflow-y-auto" style={{ maxHeight: `${contentHeight - 40}px` }}>
                {/* Icon (if provided) */}
                {(config.iconUrl || config.imageUrl) && (
                  <div className="flex justify-center">
                    <img 
                      src={config.iconUrl || config.imageUrl} 
                      alt="icon" 
                      className="rounded-full object-cover"
                      style={{ 
                        width: '48px',
                        height: '48px'
                      }}
                    />
                  </div>
                )}
                
                {/* Title */}
                {config.title && (
                  <h3 
                    className="font-bold text-center"
                    style={{ 
                      fontSize: '18px',
                      color: config.textColor || '#1F2937'
                    }}
                  >
                    {config.title}
                  </h3>
                )}
                
                {/* Main Text/Description */}
                <p 
                  className="text-center opacity-90"
                  style={{ 
                    fontSize: '14px'
                  }}
                >
                  {config.description || config.text}
                </p>
                
                {/* Content Type Specific Rendering */}
                {contentType === 'form' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>
                )}
                
                {contentType === 'product' && (config.iconUrl || config.imageUrl) && (
                  <div className="space-y-3">
                    <img 
                      src={config.iconUrl || config.imageUrl} 
                      alt="product" 
                      className="w-full rounded-lg object-cover"
                      style={{ maxHeight: '120px' }}
                    />
                    <p className="text-lg font-bold text-center">$99.99</p>
                  </div>
                )}
                
                {contentType === 'carousel' && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        Slide {idx}
                      </div>
                    ))}
                  </div>
                )}
                
                {contentType === 'media' && config.videoUrl && (
                  <div className="w-full rounded-lg overflow-hidden bg-black" style={{ height: '120px' }}>
                    <div className="flex items-center justify-center h-full text-white text-xs">
                      🎥 Video Player
                    </div>
                  </div>
                )}
                
                {/* Buttons */}
                {config.buttonText && (
                  <div className="space-y-3 pt-2">
                    <button
                      className="w-full py-2.5 rounded-lg font-medium text-sm transition-all"
                      style={{
                        backgroundColor: config.buttonColor || config.textColor || '#6366F1',
                        color: '#FFFFFF',
                        borderRadius: '8px'
                      }}
                    >
                      {config.buttonText}
                    </button>
                    {config.secondaryButtonText && (
                      <button 
                        className="w-full py-2.5 rounded-lg text-sm transition-all"
                        style={{
                          border: `1px solid ${config.textColor || '#6366F1'}`,
                          color: config.textColor || '#6366F1',
                          backgroundColor: 'transparent',
                          borderRadius: '8px'
                        }}
                      >
                        {config.secondaryButtonText}
                      </button>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        );

      case "tooltip":
        return (
          <div className="absolute inset-0 bg-black/20">
            <div
              className={`absolute ${
                config.position === "top" ? "top-1/3" : "top-1/2"
              } left-1/2 -translate-x-1/2 max-w-[200px] animate-in zoom-in-95 duration-300`}
            >
              <div
                className="rounded-lg p-3 shadow-lg"
                style={{ backgroundColor: config.backgroundColor || "#1F2937", color: config.textColor || "#fff" }}
              >
                {config.title && (
                  <p className="text-xs font-semibold mb-1">{config.title}</p>
                )}
                <p className="text-xs">{config.text}</p>
                {config.buttonText && (
                  <button className="w-full mt-2 py-1.5 rounded bg-white/20 text-xs font-medium">
                    {config.buttonText}
                  </button>
                )}
              </div>
              {/* Arrow */}
              {config.position !== "top" && (
                <div
                  className="w-3 h-3 mx-auto -mt-1.5 rotate-45"
                  style={{ backgroundColor: config.backgroundColor || "#1F2937" }}
                />
              )}
            </div>
            {/* Target highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-white/50 animate-pulse" />
          </div>
        );

      case "pip":
        const hasVideo = config.videoUrl;
        const showAudioControl = config.showAudioControl !== false;
        
        // Get all customization values with defaults
        const pipWidth = config.width || 160;
        const pipHeight = config.height || 220;
        const cornerRadius = config.cornerRadius || 20;
        const borderWidth = config.borderWidth || 0;
        const borderColor = config.borderColor || '#FFFFFF';
        const shadowBlur = config.shadowBlur || 24;
        const glassmorphism = config.glassmorphism !== false;
        
        // Calculate position based on config
        const initialX = config.initialX || 16;
        const initialY = config.initialY || 100;
        const defaultEdge = config.defaultEdge || 'right';
        
        // Position style based on edge preference
        const positionStyle = defaultEdge === 'left' 
          ? { left: `${initialX}px`, top: `${initialY}px` }
          : defaultEdge === 'right'
          ? { right: `${initialX}px`, top: `${initialY}px` }
          : { left: `${initialX}px`, top: `${initialY}px` };
        
        return (
          <div
            className="absolute shadow-2xl animate-in slide-in-from-bottom-5 duration-500 overflow-hidden"
            style={{ 
              backgroundColor: config.backgroundColor || '#000',
              width: `${pipWidth}px`,
              height: `${pipHeight}px`,
              borderRadius: `${cornerRadius}px`,
              border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
              boxShadow: `0 ${shadowBlur/2}px ${shadowBlur}px rgba(0, 0, 0, 0.3)`,
              backdropFilter: glassmorphism ? 'blur(10px)' : 'none',
              ...positionStyle
            }}
          >
            {/* Video or content fills entire card */}
            <div className="relative w-full h-full">
              {hasVideo ? (
                // Actual video player with YouTube/URL support
                <div className="w-full h-full bg-black">
                  {config.videoUrl.includes('youtube.com') || config.videoUrl.includes('youtu.be') ? (
                    // YouTube embed
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${extractYouTubeId(config.videoUrl)}?autoplay=1&mute=${config.defaultMuted !== false ? '1' : '0'}&controls=0&loop=1&playlist=${extractYouTubeId(config.videoUrl)}`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{ border: 'none' }}
                    />
                  ) : (
                    // Direct video URL - must be muted for autoplay to work
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover bg-black"
                      src={config.videoUrl}
                      autoPlay
                      loop
                      muted // Always muted for autoplay policy
                      playsInline
                      controls={false}
                      preload="auto"
                      crossOrigin="anonymous"
                      onLoadedData={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.play().catch(err => console.log('Play failed:', err));
                      }}
                      onError={(e) => {
                        console.error('Video load error:', e);
                        console.error('Video URL:', config.videoUrl);
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                // Fallback content (icon + text)
                <div 
                  className="w-full h-full flex flex-col items-center justify-center p-3"
                  style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
                    {config.iconUrl ? (
                      <img src={config.iconUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[11px] text-center leading-tight line-clamp-3">
                    {config.text || "Tap to play"}
                  </p>
                </div>
              )}

              {/* Overlay controls - always on top */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top controls */}
                <div className="flex justify-between items-center p-2 gap-1 pointer-events-auto">
                  {/* Quality Badge */}
                  {config.showQualityBadge !== false && hasVideo && (
                    <div className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-semibold">
                      {config.defaultQuality || 'Auto'}
                    </div>
                  )}
                  
                  <div className="flex-1" />
                  
                  {/* Single Maximize/Minimize toggle button */}
                  <button className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  {/* Close button */}
                  <button className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>

                {/* Progress bar (if enabled) */}
                {config.showProgressBar !== false && hasVideo && (
                  <div className="absolute top-12 left-0 right-0 px-2">
                    <div className="h-0.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-1/3" style={{ transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-auto">
                  {/* Time display (if enabled) */}
                  {config.showTimeDisplay !== false && hasVideo && (
                    <div className="flex justify-center mb-1">
                      <div className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        0:42 / 2:15
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-end justify-between">
                    {/* Text/Title overlay (if video) */}
                    {hasVideo && config.title && (
                      <div className="flex-1 mb-1">
                        <p className="text-white text-xs font-semibold drop-shadow-lg line-clamp-2">
                          {config.title}
                        </p>
                      </div>
                    )}
                    
                    {/* Audio control */}
                    {showAudioControl && hasVideo && (
                      <button className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center ml-2">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          {config.defaultMuted !== false ? (
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          ) : (
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                          )}
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* CTA Button removed from preview - only shows in expanded mode in actual app */}
                </div>
              </div>
            </div>
          </div>
        );

      case "scratch_card":
        return (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl overflow-hidden max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div
                className="h-48 flex flex-col items-center justify-center relative"
                style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
              >
                <Gift className="h-12 w-12 mb-2" style={{ color: config.buttonColor || "#FFB800" }} />
                {config.rewardAmount && (
                  <p className="text-3xl font-bold mb-1" style={{ color: config.buttonColor || "#FFB800" }}>
                    {config.rewardAmount}
                  </p>
                )}
                <p className="text-sm font-semibold">{config.rewardText || "Congratulations!"}</p>
                {/* Scratch overlay effect */}
                <div className="absolute inset-0 bg-gray-300/50 flex items-center justify-center">
                  <p className="text-sm text-gray-600 font-medium">Scratch to reveal</p>
                </div>
              </div>
              <div className="p-4">
                <button
                  className="w-full py-2.5 rounded-lg font-medium text-sm"
                  style={{ backgroundColor: config.buttonColor || "#FFB800", color: "#fff" }}
                >
                  {config.buttonText || "Claim Reward"}
                </button>
              </div>
            </div>
          </div>
        );

      case "story_carousel":
        return (
          <div className="absolute inset-0 bg-black">
            {/* Progress bars */}
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  {i === 1 && <div className="h-full w-2/3 bg-white" />}
                </div>
              ))}
            </div>
            {/* Close button */}
            <button className="absolute top-3 right-3 z-10 text-white">
              <X className="h-4 w-4" />
            </button>
            {/* Story content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent">
              <h3 className="text-white text-xl font-bold mb-2">{config.title || "Story"}</h3>
              <p className="text-white/90 text-sm mb-4">{config.text}</p>
              {config.buttonText && (
                <button className="w-full py-2.5 bg-white text-black rounded-lg font-semibold text-sm">
                  {config.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      case "inline":
        if (config.variant === "banner") {
          return (
            <div className="absolute top-20 left-4 right-4 animate-in slide-in-from-top-3 duration-500">
              <div
                className="rounded-lg p-3 shadow"
                style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  <p className="text-xs flex-1">{config.text}</p>
                  {config.buttonText && (
                    <button className="text-xs font-semibold underline">{config.buttonText}</button>
                  )}
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="absolute top-20 left-4 right-4 animate-in fade-in duration-500">
              <div
                className="rounded-xl overflow-hidden shadow-lg border"
                style={{
                  backgroundColor: config.backgroundColor,
                  color: config.textColor,
                  borderColor: config.textColor + "20",
                }}
              >
                <div className="p-4">
                  {config.title && (
                    <h4 className="text-sm font-semibold mb-2">{config.title}</h4>
                  )}
                  <p className="text-xs opacity-90 mb-3">{config.text}</p>
                  {config.buttonText && (
                    <button
                      className="w-full py-2 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: config.buttonColor || config.textColor,
                        color: "#fff",
                      }}
                    >
                      {config.buttonText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }

      default:
        return (
          <div
            className="absolute bottom-4 left-4 right-4 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-500"
            style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
          >
            <p className="text-sm font-semibold mb-3">{config.text}</p>
            <button
              className="w-full px-4 py-2 rounded-lg font-medium text-sm"
              style={{ backgroundColor: config.textColor, color: config.backgroundColor }}
            >
              {config.buttonText || "Continue"}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-gradient-to-b from-background to-muted rounded-[2.5rem] border-[8px] border-foreground/20 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/20 rounded-b-2xl z-10" />
        
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 text-xs text-foreground/60 z-10">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-3 border border-current rounded-sm" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="relative w-full h-full pt-12 pb-4 bg-background">
          {/* Mock App Content */}
          <div className="px-4 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20" />
              <div>
                <div className="h-3 w-24 bg-foreground/10 rounded" />
                <div className="h-2 w-16 bg-foreground/10 rounded mt-2" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>

          {/* Nudge Overlay */}
          {renderNudge()}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full z-10" />
      </div>

      <div className="mt-4 flex items-center text-sm text-muted-foreground">
        <Smartphone className="h-4 w-4 mr-2" />
        <span>Live preview • {config.type.replace("_", " ").charAt(0).toUpperCase() + config.type.slice(1)}</span>
      </div>
    </div>
  );
};
