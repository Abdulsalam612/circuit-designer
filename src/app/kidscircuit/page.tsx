import { permanentRedirect } from "next/navigation"

// The first kids prototype lived here. CirKit Kids replaced it; old links go to the missions.
export default function OldKidsPage() {
  permanentRedirect("/kids")
}
