export async function playPayoutVoiceNotification(amount) {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!apiKey) return

    const voiceId = "21m00Tcm4TlvDq8ikWAM"
    const text = `Your claim has been approved. ₹${amount} has been credited to your account.`

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!response.ok) return

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    await audio.play()
  } catch (error) {
    console.error("Voice notification failed:", error)
  }
}
