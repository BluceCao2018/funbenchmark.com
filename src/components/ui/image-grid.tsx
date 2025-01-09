'use client'

import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'

interface ImageGridProps {
  images: string[]
  onRemove?: (index: number) => void
}

export function ImageGrid({ images, onRemove }: ImageGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((image, index) => (
        <div
          key={image}
          className="relative aspect-square rounded-lg overflow-hidden"
        >
          <img
            src={image}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 p-1.5 bg-black/50 hover:bg-black/70 
                       rounded-full text-white transition-colors duration-200 z-10"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
} 