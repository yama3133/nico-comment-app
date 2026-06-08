---
title: I built a web app that overlays Niconico-style scrolling comments onto your slides (PowerPoint-ready, keyless OIDC)
published: false
tags: nextjs, aws, lambda, webdev
cover_image: https://raw.githubusercontent.com/yama3133/nico-comment-app/main/docs/thumb-en.png
---

What if comments scrolled across your talk slides like on Niconico Douga (a Japanese video site famous for comments flying over the video)? That idea turned into a web app that overlays scrolling comments onto an existing `.pptx`.

- Live: https://nico-comment-app.vercel.app
- Source: https://github.com/yama3133/nico-comment-app

![Main screen](https://raw.githubusercontent.com/yama3133/nico-comment-app/main/docs/main-en.png)

## What it does

1. Upload a `.pptx`
2. Pick which slides get comments (`all` / `1,3,5-7`)
3. Type comments with colors, tune the scroll speed, etc.
4. Hit "Generate" and download a `.pptx` with the comments baked in

Run the slideshow in PowerPoint / Keynote and the comments scroll right-to-left.

## First hurdle: how to animate inside PowerPoint

My first attempt used **PowerPoint's native motion-path animation** — writing the XML that moves a text box from right to left directly via `python-pptx`.

It failed **three times in a row**:

- 1st: all comments stacked in the center (wrong initial position)
- 2nd: nothing moved in the slideshow — it just froze
- 3rd: PowerPoint reported "there is a problem with the content" and **"repaired" it by deleting the animation**

The root cause was hand-written animation XML that didn't match PowerPoint's schema — and, more importantly, I was shipping it **without being able to verify playback in my own environment**. Lesson: don't ship "it should work" for something you can't verify.

## The fix: overlay a transparent animated GIF

I switched approaches: **generate a transparent animated GIF of scrolling comments and overlay it full-bleed on the slide.**

- PowerPoint / Keynote **auto-play animated GIFs** in slideshow mode (built-in)
- A GIF lets me **extract frames and verify it actually moves**
- No more animation-XML schema headaches

Generating the GIF with Pillow is just drawing comments frame by frame:

```python
for f in range(n_frames):
    t = f / fps
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for it in items:
        x = width - speed * (t - it["start"])  # right -> left
        d.text((x, it["y"]), it["text"], font=font,
               fill=it["color"], stroke_width=stroke, stroke_fill=(0,0,0,255))
    # quantize to a palette with transparency, then append the frame
```

Then `python-pptx`'s `add_picture` overlays the GIF over each slide. The pptx diff turned out to be just 4 spots ("register GIF in Content_Types", "add GIF to media", "add the relationship", "add a `<p:pic>` to the slide XML"), so it's reproducible in the browser or on the server.

## Architecture

![Architecture](https://raw.githubusercontent.com/yama3133/nico-comment-app/main/docs/arch-en.png)

- **Frontend (Next.js / Vercel)**: pptx parsing (JSZip) and live preview (Canvas) happen entirely in the browser — you can preview without sending the deck anywhere
- **Backend (AWS Lambda, Tokyo)**: the heavy GIF generation runs in a container Lambda with Pillow + python-pptx, bundling Noto Sans JP for Japanese text
- **Storage (S3)**: uploads go straight to S3 via a presigned PUT, dodging Vercel/Lambda payload limits and handling larger decks. Inputs/outputs auto-delete after 24h

## Keyless with Vercel OIDC Federation

I initially planned to expose a Lambda Function URL and call it directly, but **public access was blocked by the environment's guardrails** (`403 Forbidden`).

So I moved to **Vercel OIDC Federation**. The OIDC token issued to the Vercel function is exchanged via AWS `AssumeRoleWithWebIdentity` for short-lived credentials to invoke Lambda. The win: **no long-lived access keys stored anywhere.**

```ts
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

const lambda = new LambdaClient({
  region: "ap-northeast-1",
  credentials: awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN }),
});
```

On the AWS side, register Vercel's issuer (`https://oidc.vercel.com/<team>`) as an OIDC provider, and scope the IAM role's trust policy to a specific project's production environment.

## A note on rights

Niconico's feature of comments scrolling over a video (the "comment delivery system") is reportedly patented by its operator.

What this tool does is overlay **pre-written comments as a visual effect**; each comment is embedded as a transparent GIF and plays **locally, without any network**. That differs from a system where an unspecified crowd posts comments over the internet that are synchronized in real time via a server. Still, the right call depends on usage — for commercial/streaming use you should verify the rights yourself, and **displaying real-time incoming comments during a live stream is out of scope** for this tool. The app includes a notice page about this.

## Takeaways

- To make PowerPoint animate **reliably**, overlaying an **animated GIF** beat native animation
- Choosing a method you can **verify yourself** is the fastest path in the end
- Connecting to AWS **keylessly** via Vercel OIDC is great even for hobby projects

Give it a try → https://nico-comment-app.vercel.app
