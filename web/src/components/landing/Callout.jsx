import { createEffect } from "solid-js"

export default function Callout() {
  createEffect(() => {
    console.log("hi")
  })
  return <div>Callout</div>
}
