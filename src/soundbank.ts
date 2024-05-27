import MECH_KEYBOARD_SOUND from '/sounds/mech-keyboard-02-102918.mp3'
import BACKGROUND_TRACK from '/sounds/stardust-danijel-zambo-main-version-03-13-1372.mp3'

export const backgroundTrack = new Audio
backgroundTrack.src = BACKGROUND_TRACK
backgroundTrack.loop = true
backgroundTrack.volume = 0.6

export const mechSound = new Audio
mechSound.src = MECH_KEYBOARD_SOUND



