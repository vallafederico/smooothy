// Main application entry point
// Add your initialization code here

export class App {
  static init() {
    // Initialize your app here
    document.body.classList.add("started")
  }
}

// Initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => App.init())
} else {
  App.init()
}
