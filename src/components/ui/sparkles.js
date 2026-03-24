import React, { useId, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "framer-motion";

// Simple utility function to merge class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const SparklesCore = (props) => {
  const {
    id,
    className,
    background = "transparent",
    minSize = 0.6,
    maxSize = 1.4,
    speed = 1,
    particleColor = "#ffffff",
    particleDensity = 100,
  } = props;

  const [init, setInit] = useState(false);
  const [error, setError] = useState(false);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      try {
        await loadSlim(engine);
        setInit(true);
      } catch (err) {
        console.error("Failed to load particles:", err);
        setError(true);
      }
    });
  }, []);

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      });
    }
  };

  // Fallback sparkles using CSS animation if particles fail
  if (error || !init) {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>
      <Particles
        id={id || generatedId}
        className="h-full w-full"
        particlesLoaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: background,
            },
          },
          fullScreen: {
            enable: false,
            zIndex: 1,
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: false,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: particleColor,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "out",
              },
              random: false,
              speed: speed,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                width: 400,
                height: 400,
              },
              value: particleDensity,
            },
            opacity: {
              value: {
                min: 0.1,
                max: 1,
              },
              animation: {
                enable: true,
                speed: speed,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: {
                min: minSize,
                max: maxSize,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </motion.div>
  );
};