"use client"

import { useEffect, useRef, useState } from "react"
import type { Block, BlockType } from "@/types/kids"
import { BLOCKLY_TYPE, HAT_TYPE, programToState, stateToProgram, type SavedWorkspace } from "@/lib/kids/blocks"

// The block editor (Google Blockly, Apache-2.0). Blockly is loaded in the browser only. The
// program lives in the parent as Block[]; this component reports every change.
// Block colours are darkened brand colours so white block text passes contrast (4.5:1+).

const STYLES = {
  kids_event: { colourPrimary: "#8A6400", colourSecondary: "#A87B0A", colourTertiary: "#6B4E00" },
  kids_motor: { colourPrimary: "#1A66E8", colourSecondary: "#3D7FEC", colourTertiary: "#1048A8" },
  kids_light: { colourPrimary: "#9A4D00", colourSecondary: "#B05E0C", colourTertiary: "#7A3D00" },
  kids_control: { colourPrimary: "#127436", colourSecondary: "#1E8A46", colourTertiary: "#0B4D23" },
  kids_sound: { colourPrimary: "#7C3AED", colourSecondary: "#8B52F0", colourTertiary: "#5B21B6" },
}

const PORTS = [["A", "A"], ["B", "B"]]

const BLOCK_DEFS = [
  { type: HAT_TYPE, message0: "when Go is pressed", nextStatement: null, style: "kids_event",
    tooltip: "Your program starts here. Blocks run from top to bottom." },
  { type: BLOCKLY_TYPE.motorOn, message0: "motor %1 forward, speed %2", style: "kids_motor", previousStatement: null, nextStatement: null,
    args0: [
      { type: "field_dropdown", name: "PORT", options: PORTS },
      { type: "field_dropdown", name: "SPEED", options: [["25%", "25"], ["50%", "50"], ["75%", "75"], ["100%", "100"]] },
    ],
    tooltip: "Starts the motor plugged into this port." },
  { type: BLOCKLY_TYPE.motorOff, message0: "motor %1 stop", style: "kids_motor", previousStatement: null, nextStatement: null,
    args0: [{ type: "field_dropdown", name: "PORT", options: PORTS }], tooltip: "Stops the motor." },
  { type: BLOCKLY_TYPE.lightOn, message0: "light %1 on", style: "kids_light", previousStatement: null, nextStatement: null,
    args0: [{ type: "field_dropdown", name: "PORT", options: PORTS }], tooltip: "Turns the light on." },
  { type: BLOCKLY_TYPE.lightOff, message0: "light %1 off", style: "kids_light", previousStatement: null, nextStatement: null,
    args0: [{ type: "field_dropdown", name: "PORT", options: PORTS }], tooltip: "Turns the light off." },
  { type: BLOCKLY_TYPE.wait, message0: "wait %1 seconds", style: "kids_control", previousStatement: null, nextStatement: null,
    args0: [{ type: "field_number", name: "SECONDS", value: 1, min: 0.5, max: 20, precision: 0.5 }],
    tooltip: "Waits. Motors and lights keep doing what you told them." },
  { type: BLOCKLY_TYPE.repeat, message0: "repeat %1 times", message1: "%1", style: "kids_control", previousStatement: null, nextStatement: null,
    args0: [{ type: "field_number", name: "TIMES", value: 3, min: 1, max: 20, precision: 1 }],
    args1: [{ type: "input_statement", name: "DO" }], tooltip: "Runs the blocks inside again and again." },
  { type: BLOCKLY_TYPE.beep, message0: "beep", style: "kids_sound", previousStatement: null, nextStatement: null, tooltip: "Makes a short beep." },
]

// Sensible defaults when a block is dragged out: the motor is on A, the light on B
const PALETTE_FIELDS: Partial<Record<BlockType, Record<string, string | number>>> = {
  motorOn: { PORT: "A", SPEED: "50" },
  lightOn: { PORT: "B" },
  lightOff: { PORT: "B" },
}

// Block types and the theme are registered with Blockly once per page load
let defined = false
let kidsTheme: unknown = null

interface BlocklyEditorProps {
  blocks: BlockType[]
  initial: Block[]
  onChange: (program: Block[]) => void
}

export default function BlocklyEditor({ blocks, initial, onChange }: BlocklyEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  // The program to load is fixed when the editor opens; later edits flow out through onChange
  const initialRef = useRef(initial)
  const blocksKey = blocks.join(",")
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    ;(async () => {
      try {
        const Blockly = await import("blockly/core")
        const En = await import("blockly/msg/en")
        if (disposed || !host.current) return
        Blockly.setLocale(En as unknown as { [key: string]: string })
        if (!defined) {
          Blockly.common.defineBlocksWithJsonArray(BLOCK_DEFS)
          defined = true
        }
        kidsTheme ??= Blockly.Theme.defineTheme("cirkit-kids", {
          name: "cirkit-kids",
          base: Blockly.Themes.Zelos,
          blockStyles: STYLES,
          componentStyles: {
            workspaceBackgroundColour: "#F5F8FD",
            flyoutBackgroundColour: "#FFFFFF",
            flyoutOpacity: 1,
            scrollbarColour: "#B8C4D4",
            insertionMarkerColour: "#1A66E8",
          },
          fontStyle: { family: "Lexend, ui-sans-serif, sans-serif", weight: "600", size: 13 },
          startHats: true,
        })
        const theme = kidsTheme as InstanceType<typeof Blockly.Theme>
        const workspace = Blockly.inject(host.current, {
          toolbox: {
            kind: "flyoutToolbox",
            contents: blocksKey.split(",").map(type => ({
              kind: "block",
              type: BLOCKLY_TYPE[type as BlockType],
              ...(PALETTE_FIELDS[type as BlockType] ? { fields: PALETTE_FIELDS[type as BlockType] } : {}),
            })),
          },
          renderer: "zelos",
          theme,
          media: "/blockly-media/",
          trashcan: true,
          zoom: { controls: true, wheel: false, startScale: 0.9, maxScale: 1.6, minScale: 0.5 },
          move: { scrollbars: true, drag: true, wheel: true },
          grid: { spacing: 20, length: 1, colour: "#E6EDF8", snap: true },
        })
        Blockly.serialization.workspaces.load(programToState(initialRef.current) as object, workspace)
        // Blocks not attached under the hat are greyed out (they won't run)
        workspace.addChangeListener(Blockly.Events.disableOrphans)
        workspace.addChangeListener((e: { isUiEvent?: boolean }) => {
          if (e.isUiEvent) return
          const state = Blockly.serialization.workspaces.save(workspace) as SavedWorkspace
          onChangeRef.current(stateToProgram(state))
        })
        // Keep Blockly's drawing area in step with its box
        const resize = new ResizeObserver(() => Blockly.svgResize(workspace))
        resize.observe(host.current)
        cleanup = () => {
          resize.disconnect()
          workspace.dispose()
        }
      } catch (err) {
        console.error("Couldn't start the block editor:", err)
        if (!disposed) setFailed(true)
      }
    })()
    return () => {
      disposed = true
      cleanup()
    }
  }, [blocksKey])

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-ink-muted" role="alert">
        The block editor didn&apos;t load. Reload the page to try again.
      </div>
    )
  }
  return <div ref={host} className="h-full w-full" aria-label="Block editor: drag blocks under “when Go is pressed”" />
}
