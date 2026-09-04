# Thamo — kinetic type

A single-screen personal introduction based on the existing thamo.de identity. Preserve the real name, role, copy, GitHub and contact address. Open typography and one interactive ASCII scene replace the glass panel. No additional marketing sections.

## Visual system

Runtime tokens live in src/style.css: background #080b10, text #f3f5f7, muted #979da7, accent #28c8ef, rule #303740. Local Monaspace Neon is the page font; Courier New supplies canvas glyphs. Desktop uses a 47/53 text/art split, mobile stacks the intro and scene. Keep the name prominent, controls small, and both marks visible. The source concept is artifacts/design-concept.png.

## Behavior

On arrival, one complete speed-mode burst plays and eases into normal motion. Turning Speed mode on keeps it active and takes precedence over the intro. Speed mode toggles sustained acceleration, orbit trails, streams, and periodic scatter/reformation. The inline do things action triggers one burst. Pointer proximity repels nearby characters. Accessible native buttons and links provide keyboard operation. Reduced motion suppresses continuous animation and bursts. Hidden documents stop the animation loop. Pretext prepares the glyph metrics and Salesforce wordmark once, outside the frame loop; animation uses these measured values.

## Intentional concept adaptations

Use the actual site's Monaspace font and original destinations. Real animated marks vary across frames rather than matching a single generated pose. The cloud has a readable Salesforce wordmark. Mobile hides the ornamental middle footer note. The primary identity and body copy are unchanged from the brief and live site; the design adds the explicitly functional Speed mode and do things controls.
