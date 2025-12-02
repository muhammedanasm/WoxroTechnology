"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { cubesConfig } from "./Data";
import "./banner.css";

gsap.registerPlugin(ScrollTrigger);

export default function Banner() {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const gridRef = useRef(null);
  const headOneRef = useRef(null);
  const headTwoRef = useRef(null);
  const cubeRefs = useRef({});

  // Helper for animation
  const interpolate = (start, end, progress) => {
    return start + (end - start) * progress;
  };

  useLayoutEffect(() => {
    // 1. Initialize Smooth Scroll
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Main Animation Logic
    const ctx = gsap.context(() => {
      const height = window.innerHeight * 4;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${height}px`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const prog = self.progress;

          // Logo Animation
          const logoBlur = interpolate(0, 20, Math.min(prog * 20, 1));
          logoRef.current.style.filter = `blur(${logoBlur}px)`;
          const logoOpacity =
            prog >= 0.02 ? Math.min((prog - 0.02) * 100, 1) : 0;
          logoRef.current.style.opacity = 1 - logoOpacity;

          // Cubes Container Opacity
          const gridOpacity =
            prog > 0.01 ? Math.min((prog - 0.01) * 100, 1) : 0;
          gridRef.current.style.opacity = gridOpacity;

          // Headline 1 Animation
          const h1Prog = Math.min(prog * 2.5, 1);
          const h1Scale = interpolate(1, 1.5, h1Prog);
          const h1Blur = interpolate(0, 20, h1Prog);
          headOneRef.current.style.transform = `translate(-50%, -50%) scale(${h1Scale})`;
          headOneRef.current.style.filter = `blur(${h1Blur}px)`;
          headOneRef.current.style.opacity = 1 - h1Prog;

          // Headline 2 Animation
          const h2Raw = (prog - 0.4) * 10;
          const h2Prog = Math.max(0, Math.min(h2Raw, 1));
          const h2Scale = interpolate(0.75, 1, h2Prog);
          const h2Blur = interpolate(10, 0, h2Prog);

          headTwoRef.current.style.transform = `translate(-50%, -50%) scale(${h2Scale})`;
          headTwoRef.current.style.filter = `blur(${h2Blur}px)`;
          headTwoRef.current.style.opacity = h2Prog;

          // Cubes Movement
          const phase1 = Math.min(prog * 2, 1);
          const phase2 = prog >= 0.5 ? (prog - 0.5) * 2 : 0;

          Object.keys(cubesConfig).forEach((key) => {
            const el = cubeRefs.current[key];
            if (!el) return;

            const { start, end } = cubesConfig[key];

            const top = interpolate(start.top, end.top, phase1);
            const left = interpolate(start.left, end.left, phase1);
            const rx = interpolate(start.rx, end.rx, phase1);
            const ry = interpolate(start.ry, end.ry, phase1);
            const rz = interpolate(start.rz, end.rz, phase1);
            const z = interpolate(start.z, end.z, phase1);

            let extraRot = 0;
            if (key === "box2") extraRot = interpolate(0, 180, phase2);
            if (key === "box4") extraRot = interpolate(0, -180, phase2);

            el.style.top = `${top}%`;
            el.style.left = `${left}%`;
            el.style.transform = `
              translate3d(-50%, -50%, ${z}px)
              rotateX(${rx}deg)
              rotateY(${ry + extraRot}deg)
              rotateZ(${rz}deg)
            `;
          });
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(lenis.raf);
      lenis.destroy();
    };
  }, []);

  // Helper to render faces with sequential images (1-36)
  //   let globalImgCount = 1;
  //   const renderFaces = () => {
  //     return [1, 2, 3, 4, 5, 6].map((i) => {
  //       const src = `/assets/img${globalImgCount}.jpg`;
  //       globalImgCount++;
  //       return (
  //         <div key={i} className={`box-face face-${i}`}>
  //           <img src={src} alt="Cube face" />
  //         </div>
  //       );
  //     });
  //   };

  return (
    <div>
      <section className="scroll-stage" ref={containerRef}>
        {/* Logo */}
        <div className="brand-mark" ref={logoRef}>
          <div className="mark-col">
            <div className="shape shape-tilt-right"></div>
            <div className="shape"></div>
          </div>
          <div className="mark-col">
            <div className="shape"></div>
            <div className="shape"></div>
          </div>
          <div className="mark-col">
            <div className="shape shape-tilt-left"></div>
            <div className="shape"></div>
          </div>
        </div>

        {/* 3D cubes */}
        <div className="grid-wrapper" ref={gridRef}>
          {Object.keys(cubesConfig).map((key, cubeIndex) => (
            <div
              key={key}
              className="box-unit"
              ref={(el) => (cubeRefs.current[key] = el)}
              // Set initial position to avoid jump
              style={{
                top: `${cubesConfig[key].start.top}%`,
                left: `${cubesConfig[key].start.left}%`,
                transform: `translate3d(-50%, -50%, ${cubesConfig[key].start.z}px)`,
              }}
            >
              {/* {renderFaces()} */}
              {/* Loop 1-6 for the faces */}
              {[1, 2, 3, 4, 5, 6].map((faceNum) => {
                // Since you have 6 images and 6 faces:
                // Face 1 uses img1.svg
                // Face 2 uses img2.svg
                // ...
                // Face 6 uses img6.svg
                const imgNumber = faceNum;

                return (
                  <div key={faceNum} className={`box-face face-${faceNum}`}>
                    <img
                      src={`/images/img${imgNumber}.svg`}
                      alt={`Face ${faceNum}`}
                      draggable="false"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="main-headline" ref={headOneRef}>
          <h1>
            The First Media Company crafted For the Digital First generation
          </h1>
        </div>

        <div className="sub-headline" ref={headTwoRef}>
          <h2>Where innovation meets precision.</h2>
          <p>
            Symphonia unites visionary thinkers, creative architects, and
            analytical experts, collaborating seamlessly to transform challenges
            into oppurtunities. Together, we deliver tailored solutions that
            drive impact and inspire growth.
          </p>
        </div>
      </section>

      <section className="next-content">
        <h2>Your next section goes here.</h2>
      </section>
    </div>
  );
}
