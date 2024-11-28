'use client'

import { useEffect, useRef } from 'react'
import { initShaders } from './shaders'

interface FluidTransitionProps {
  onTransitionComplete?: () => void;
}

export function FluidTransition({ onTransitionComplete }: FluidTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const timeRef = useRef(0)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')
    if (!gl) return

    glRef.current = gl
    const program = initShaders(gl)
    if (!program) return
    
    programRef.current = program
    
    // Set canvas size
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1
      const displayWidth = Math.floor(canvas.clientWidth * dpr)
      const displayHeight = Math.floor(canvas.clientHeight * dpr)

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, displayWidth, displayHeight)
      }
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Start animation
    const animate = (timestamp: number) => {
      timeRef.current = timestamp * 0.001 // Convert to seconds
      
      gl.useProgram(program)
      
      // Update uniforms
      const timeLocation = gl.getUniformLocation(program, 'u_time')
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
      
      gl.uniform1f(timeLocation, timeRef.current)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      
      frameRef.current = requestAnimationFrame(animate)
    }
    
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', setSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-10"
      style={{ background: 'white' }}
    />
  )
} 