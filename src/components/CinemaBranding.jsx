import React from "react";
import CinemaLogo from "./CinemaLogo";
import brandingImg from "../assets/branding.png";

/**
 * Official CinemaSathi Branding Lockup
 * Combines the golden emblem logo with the widescreen cinematic typography logotype banner.
 */
export default function CinemaBranding({
  showLogo = true,
  logoSize = 48,
  brandHeight = 44,
  className = "",
  style = {}
}) {
  return (
    <div
      className={`cinema-brand-lockup ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.85rem",
        userSelect: "none",
        ...style
      }}
    >
      {showLogo && <CinemaLogo size={logoSize} />}
      <img
        src={brandingImg}
        alt="Cinema साथी"
        className="brand-title-img"
        style={{
          height: `${brandHeight}px`,
          width: "auto",
          maxWidth: "190px",
          objectFit: "contain",
          display: "block"
        }}
      />
    </div>
  );
}
