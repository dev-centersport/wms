// componente Barcode.tsx
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

export default function Barcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format: 'EAN13',
        displayValue: true,
        fontSize: 14,
        height: 40,
      });
    }
  }, [value]);

  return <svg ref={svgRef} data-barcode={value}></svg>;
}
