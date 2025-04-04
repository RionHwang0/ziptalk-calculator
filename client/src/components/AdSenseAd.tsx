import { useEffect } from 'react';

interface AdSenseAdProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

const AdSenseAd = ({ slot, format = 'auto', style, className }: AdSenseAdProps) => {
  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`adsense-container ${className || ''}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%', ...style }}
        data-ad-client="ca-pub-2260236186874080"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseAd;