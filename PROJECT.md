## Web-Trumpet

Build a fun, hacky MacBook trumpet using the built-in microphones located under the speaker grills.

### Core Concept
Turn the MacBook into a wind instrument:
- Blow air across the left or right speaker grill → the mic picks up a muffled "wind" sound.
- Measure real-time audio input level (volume/amplitude) from the built-in mic(s).
- Map the detected audio level (how hard you blow) to velocity, volume, or expression for a MIDI note.
- Use the trackpad to select the pitch/note (e.g., X-axis for note selection, Y-axis for modulation or octave, or simple tapping/position for chromatic scale).
- Output the result as realistic trumpet/brass sounds (or any wind/brass virtual instrument).

The final experience should feel like playing a digital trumpet: blow to make sound, move finger on trackpad to choose notes, and get expressive trumpet tones.

### Technical Requirements
- **Audio Input**: Access MacBook's built-in microphone(s) in real-time. Continuously monitor audio levels (RMS or peak amplitude). Detect "blowing" when level exceeds a tunable threshold. Bonus: distinguish gentle vs hard blowing for dynamics.
- **MIDI Generation**: Convert blow intensity + trackpad position into MIDI messages (Note On/Off, velocity, CC for expression/breath control).
- **Trackpad Control**: Read trackpad position, gestures, or pressure (if available). Map it intuitively to pitch selection (e.g., horizontal position = note in a scale, vertical = bend or filter).
- **Sound Output**: Route MIDI to a virtual instrument. Prefer high-quality trumpet/brass VST/AU plugins or built-in macOS soundfonts. Make it sound juicy and expressive (attack, decay, vibrato via CC).
- **UI/UX**: Minimal and playful. Show a simple visualizer (mic level bar + current note). Dark mode, trumpet emoji vibes. Make it instantly fun to play.

### Extra Vibes & Polish
- Make blowing feel responsive and forgiving (smooth mapping, low latency).
- Add modes: chromatic scale, major/minor scales, or free pitch bend.
- Support multiple "instruments" (trumpet, trombone, flute, harmonium nod to similar hacks).
- Record short clips or export MIDI.
- Easter egg: original melody inspired by Krish Shah x @BurntBrownn performance at Socratic AI symposium.
- Keep it hacky, educational, and shareable — perfect for maker demos, live performances, or Twitter flex.

### Success Criteria
It should feel magical: you blow on your laptop and real trumpet sounds come out, controlled naturally by your finger on the trackpad. Low friction to start playing, high ceiling for expression.

Go wild with creativity, but keep the core "blow + trackpad = trumpet" loop tight and delightful.