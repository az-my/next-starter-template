import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

// Simple count-up hook
function useCountUp(to: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    let start: number | null = null;
    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * to));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setValue(to);
      }
    }
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [to, duration]);
  return value;
}

export function SectionCards() {
  const users = useCountUp(42);
  const files = useCountUp(128);
  const uptime = useCountUp(99);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <CardTitle className="text-2xl">{users}</CardTitle>
          <span className="text-muted-foreground">Active Users</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <CardTitle className="text-2xl">{files}</CardTitle>
          <span className="text-muted-foreground">Files Uploaded</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <CardTitle className="text-2xl">{uptime}%</CardTitle>
          <span className="text-muted-foreground">Uptime</span>
        </CardContent>
      </Card>
    </div>
  );
} 