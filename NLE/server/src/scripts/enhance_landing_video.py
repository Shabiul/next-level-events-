import cv2
import numpy as np
import subprocess
import os

def enhance_video():
    print("Starting high-quality video enhancement and star removal pipeline...")

    mask_path = "public/star_mask_clean.png"
    if not os.path.exists(mask_path):
        raise FileNotFoundError("Clean star mask not found")

    clean_mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    mask_h, mask_w = clean_mask.shape

    video_path = "public/landing page.mp4"
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"Input video: {w}x{h}, {fps} FPS, {total_frames} frames")

    roi_y = 568
    roi_x = 1125
    roi_h = mask_h
    roi_w = mask_w

    out_path = "public/landing_enhanced.mp4"
    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{w}x{h}",
        "-pix_fmt", "bgr24",
        "-r", str(fps),
        "-i", "-",
        "-vf", "scale=1920:1080:flags=lanczos,unsharp=5:5:0.8:5:5:0.4,eq=contrast=1.04:brightness=0.01:saturation=1.08",
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        out_path
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        roi = frame[roi_y:roi_y+roi_h, roi_x:roi_x+roi_w]
        inpainted_roi = cv2.inpaint(roi, clean_mask, 3, cv2.INPAINT_TELEA)
        frame[roi_y:roi_y+roi_h, roi_x:roi_x+roi_w] = inpainted_roi

        proc.stdin.write(frame.tobytes())
        frame_idx += 1
        if frame_idx % 75 == 0:
            print(f"Processed {frame_idx}/{total_frames} frames...")

    proc.stdin.close()
    proc.wait()
    cap.release()
    print(f"Enhancement complete: saved {out_path}")

if __name__ == "__main__":
    enhance_video()
