# Implementation Plan: Public Participant Access & Classroom QR Code Sharing

Empower teachers to share the game effortlessly with Year 1 pupils, teachers, and parents via a universal public access link and an in-app Classroom QR Code modal designed for smartboards and tablet scanning.

---

## 1. Verified Access URLs

- **Public Participant URL (Accessible to everyone without login)**:
  `https://ais-pre-5wzjgoctv3uwttj5accwut-759838092087.asia-northeast1.run.app`
- **Current Development URL (Restricted to workspace owner)**:
  `https://ais-dev-5wzjgoctv3uwttj5accwut-759838092087.asia-northeast1.run.app`

The application will dynamically resolve the public preview URL (or current origin when self-hosted) so that links and QR codes always work seamlessly for external participants.

---

## 2. Proposed Changes

### Component 1: `src/components/ShareModal.tsx` (New Component)
Create a responsive, circus-themed sharing modal with:
1. **Prominent QR Code**:
   - Render a high-contrast SVG QR code encoding the public URL.
   - Include an interactive **"Smartboard / Fullscreen View"** toggle that enlarges the QR code so pupils in the back row can scan it with their school tablets or Chromebook cameras.
2. **One-Tap "Copy Link" Button**:
   - Copies `https://ais-pre-5wzjgoctv3uwttj5accwut-759838092087.asia-northeast1.run.app` directly to clipboard using `navigator.clipboard.writeText`.
   - Displays instant animated visual confirmation ("Copied to Clipboard! ✓").
3. **Teacher Quick Guide**:
   - Clear badge explaining: *"Universal Access · No login, app download, or microphone permissions required"*.
   - Direct shortcuts for Google Classroom or WhatsApp/Telegram school groups.

### Component 2: `src/components/Header.tsx` (Update)
- Add a tactile, circus-styled **"Share Game" / "QR Code"** button with a `<Share2 />` / `<QrCode />` icon in the navigation bar.
- Ensure optimal layout across mobile, tablet, and desktop screens.

### Component 3: `src/components/WelcomePage.tsx` (Update)
- Add a prominent **"📱 Classroom Share & QR Code"** banner card right below the Big Play Button.
- Allow teachers starting a lesson to pop open the QR code immediately before the children start playing.

### Container: `src/App.tsx` (Update)
- Wire `isShareModalOpen` state.
- Mount `<ShareModal />` alongside other game modals.

---

## 3. Verification Plan

1. **Compilation**: Run `npm run build` to verify clean TypeScript compilation and bundle generation.
2. **QR Code & Link Resolution**: Verify that the generated QR code scans correctly and points to the public access link.
3. **Clipboard Copy**: Verify one-tap copy functionality with fallback for older browsers or restricted iframe environments.
4. **Smartboard Projection**: Ensure the modal scales smoothly up to large projector screens without layout shifts.
