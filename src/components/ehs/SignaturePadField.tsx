import { useEffect, useRef, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';

type SignaturePadFieldProps = {
  label?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  width?: number;
  height?: number;
};

const SignaturePadField = ({
  label,
  value,
  onChange,
  width = 380,
  height = 160,
}: SignaturePadFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.touchAction = 'none';

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#111827';
      context.current = ctx;
    }

    if (value) {
      const img = new Image();
      img.onload = () => {
        context.current?.clearRect(0, 0, canvas.width, canvas.height);
        context.current?.drawImage(img, 0, 0, width, height);
        setIsEmpty(false);
      };
      img.src = value;
    } else {
      context.current?.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  }, [value, width, height]);

  const pointerPosition = (event: PointerEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    if ('clientX' in event) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
    return null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = context.current;
    if (!canvas || !ctx) return;

    const startDrawing = (event: PointerEvent) => {
      const pos = pointerPosition(event);
      if (!pos) return;
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      event.preventDefault();
    };

    const draw = (event: PointerEvent) => {
      if (!drawing.current) return;
      const pos = pointerPosition(event);
      if (!pos) return;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setIsEmpty(false);
      event.preventDefault();
    };

    const endDrawing = (event: PointerEvent) => {
      if (!drawing.current) return;
      drawing.current = false;
      ctx.closePath();
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
      event.preventDefault();
    };

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', endDrawing);
    canvas.addEventListener('pointerleave', endDrawing);

    return () => {
      canvas.removeEventListener('pointerdown', startDrawing);
      canvas.removeEventListener('pointermove', draw);
      canvas.removeEventListener('pointerup', endDrawing);
      canvas.removeEventListener('pointerleave', endDrawing);
    };
  }, [onChange]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context.current) return;
    context.current.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(undefined);
  };

  return (
    <Stack gap="xs">
      {label ? (
        <Text size="sm" fw={500} c="dimmed">
          {label}
        </Text>
      ) : null}
      <Box
        style={{
          border: '1px dashed #d1d5db',
          borderRadius: 8,
          backgroundColor: '#fff',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
      </Box>
      <Group gap="xs">
        <Button variant="light" color="gray" size="xs" onClick={clearSignature} disabled={isEmpty}>
          Clear
        </Button>
      </Group>
    </Stack>
  );
};

export default SignaturePadField;
