"use client"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface SystemInfoData {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  platform: string;
  language: string;
  languages: string;
  screen: string;
  colorDepth: number;
  cookiesEnabled: boolean;
  online: boolean;
  deviceMemory: string | number;
  hardwareConcurrency: string | number;
  touchSupport: string;
  timezone: string;
  date: string;
  colorScheme: string;
  referrer: string;
  doNotTrack: string;
  batteryLevel: string;
  batteryCharging: string;
  networkType: string;
  networkDownlink: string;
  networkRtt: string;
  geolocation: string;
  orientation: string;
  plugins: string;
  clipboard: string;
}

export function SystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfoData | null>(null)

  useEffect(() => {
    async function gatherInfo() {
      let battery = null
      let geolocation = null
      let orientation = null
      let plugins: string[] = []
      let clipboard = false
      // Battery
      const navAny = navigator as Navigator & {
        getBattery?: () => Promise<{ level: number; charging: boolean }>;
        deviceMemory?: number;
        connection?: { effectiveType: string; downlink: number; rtt: number };
        plugins?: { name: string }[];
      }
      if (typeof navAny.getBattery === 'function') {
        try {
          battery = await navAny.getBattery()
        } catch {}
      }
      // Geolocation
      if (navigator.geolocation) {
        try {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                geolocation = `${pos.coords.latitude}, ${pos.coords.longitude}`
                resolve(true)
              },
              () => resolve(false),
              { timeout: 2000 }
            )
          })
        } catch {}
      }
      // Orientation
      orientation = typeof window.DeviceOrientationEvent !== 'undefined' ? 'Supported' : 'Not supported'
      // Plugins
      if (navAny.plugins && navAny.plugins.length > 0) {
        plugins = Array.from(navAny.plugins).map((p) => p.name)
      }
      // Clipboard
      clipboard = !!navigator.clipboard
      // Browser name/version/os
      const ua = navigator.userAgent
      let browser = 'Unknown', version = '', os = 'Unknown'
      if (/chrome|crios|crmo/i.test(ua)) {
        browser = 'Chrome'
        version = ua.match(/(?:chrome|crios|crmo)\/([\d.]+)/i)?.[1] || ''
      } else if (/firefox|fxios/i.test(ua)) {
        browser = 'Firefox'
        version = ua.match(/(?:firefox|fxios)\/([\d.]+)/i)?.[1] || ''
      } else if (/safari/i.test(ua)) {
        browser = 'Safari'
        version = ua.match(/version\/([\d.]+)/i)?.[1] || ''
      } else if (/edg/i.test(ua)) {
        browser = 'Edge'
        version = ua.match(/edg\/([\d.]+)/i)?.[1] || ''
      }
      if (/windows/i.test(ua)) os = 'Windows'
      else if (/android/i.test(ua)) os = 'Android'
      else if (/linux/i.test(ua)) os = 'Linux'
      else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
      else if (/mac/i.test(ua)) os = 'MacOS'
      setSystemInfo({
        userAgent: ua,
        browser,
        browserVersion: version,
        os,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages?.join(', ') || 'N/A',
        screen: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        cookiesEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
        deviceMemory: typeof navAny.deviceMemory !== 'undefined' ? navAny.deviceMemory : 'N/A',
        hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 'Yes' : 'No',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date: new Date().toString(),
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light',
        referrer: document.referrer || 'N/A',
        doNotTrack: navigator.doNotTrack === '1' ? 'Yes' : 'No',
        batteryLevel: battery ? `${Math.round(battery.level * 100)}%` : 'N/A',
        batteryCharging: battery ? (battery.charging ? 'Yes' : 'No') : 'N/A',
        networkType: navAny.connection?.effectiveType || 'N/A',
        networkDownlink: navAny.connection?.downlink ? `${navAny.connection.downlink} Mbps` : 'N/A',
        networkRtt: navAny.connection?.rtt ? `${navAny.connection.rtt} ms` : 'N/A',
        geolocation: geolocation || 'N/A',
        orientation,
        plugins: plugins.length ? plugins.join(', ') : 'None',
        clipboard: clipboard ? 'Supported' : 'Not supported',
      })
    }
    gatherInfo()
  }, [])

  if (!systemInfo) return null

  return (
    <Card className="mt-4 w-full max-w-md">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">System Info</h2>
        <ul className="text-sm space-y-1">
          <li><b>User Agent:</b> {systemInfo.userAgent}</li>
          <li><b>Browser:</b> {systemInfo.browser} {systemInfo.browserVersion}</li>
          <li><b>OS:</b> {systemInfo.os}</li>
          <li><b>Platform:</b> {systemInfo.platform}</li>
          <li><b>Language:</b> {systemInfo.language}</li>
          <li><b>Languages:</b> {systemInfo.languages}</li>
          <li><b>Screen:</b> {systemInfo.screen}</li>
          <li><b>Color Depth:</b> {systemInfo.colorDepth}</li>
          <li><b>Cookies Enabled:</b> {systemInfo.cookiesEnabled ? "Yes" : "No"}</li>
          <li><b>Online:</b> {systemInfo.online ? "Yes" : "No"}</li>
          <li><b>Device Memory:</b> {typeof systemInfo.deviceMemory === 'number' ? `${systemInfo.deviceMemory} GB` : systemInfo.deviceMemory}</li>
          <li><b>CPU Cores:</b> {String(systemInfo.hardwareConcurrency)}</li>
          <li><b>Touch Support:</b> {systemInfo.touchSupport}</li>
          <li><b>Timezone:</b> {systemInfo.timezone}</li>
          <li><b>Date/Time:</b> {systemInfo.date}</li>
          <li><b>Color Scheme:</b> {systemInfo.colorScheme}</li>
          <li><b>Referrer:</b> {systemInfo.referrer}</li>
          <li><b>Do Not Track:</b> {systemInfo.doNotTrack}</li>
          <li><b>Battery Level:</b> {systemInfo.batteryLevel}</li>
          <li><b>Battery Charging:</b> {systemInfo.batteryCharging}</li>
          <li><b>Network Type:</b> {systemInfo.networkType}</li>
          <li><b>Network Downlink:</b> {systemInfo.networkDownlink}</li>
          <li><b>Network RTT:</b> {systemInfo.networkRtt}</li>
          <li><b>Geolocation:</b> {systemInfo.geolocation}</li>
          <li><b>Orientation:</b> {systemInfo.orientation}</li>
          <li><b>Plugins:</b> {systemInfo.plugins}</li>
          <li><b>Clipboard:</b> {systemInfo.clipboard}</li>
        </ul>
      </div>
    </Card>
  )
}
