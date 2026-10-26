import React from "react";
import logoImg from "../assets/logo.png";

/**
 * CinemaSathi Official Emblem Logo
 * Features the signature golden cinema-lens reel & Devanagari "साथी" emblem.
 */
export default function CinemaLogo({ size = 52, className = "", alt = "CinemaSathi Logo", style = {} }) {
  return (
    <img
      src={logoImg}
      alt={alt}
      width={size}
      height={size}
      className={`cinema-logo-img ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        borderRadius: "14px",
        display: "block",
        flexShrink: 0,
        filter: "drop-shadow(0 4px 14px rgba(245, 158, 11, 0.28))",
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease",
        ...style
      }}
    />
  );
}
