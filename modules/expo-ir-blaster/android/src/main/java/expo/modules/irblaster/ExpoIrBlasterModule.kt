package expo.modules.irblaster

import android.content.Context
import android.hardware.ConsumerIrManager
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoIrBlasterModule : Module() {
  private val irManager: ConsumerIrManager?
    get() = appContext.reactContext?.getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

  override fun definition() = ModuleDefinition {
    Name("ExpoIrBlaster")

    Function("hasIrEmitter") {
      try {
        irManager?.hasIrEmitter() ?: false
      } catch (_: SecurityException) {
        false
      }
    }

    Function("getCarrierFrequencies") {
      val manager = irManager ?: return@Function emptyList<Map<String, Int>>()
      if (!manager.hasIrEmitter()) {
        return@Function emptyList<Map<String, Int>>()
      }
      val ranges = manager.carrierFrequencies ?: return@Function emptyList<Map<String, Int>>()
      ranges.map { range ->
        mapOf(
          "min" to range.minFrequency,
          "max" to range.maxFrequency
        )
      }
    }

    AsyncFunction("transmit") { carrierFrequency: Int, pattern: List<Int> ->
      val manager = irManager
        ?: throw CodedException("ERR_IR_UNSUPPORTED", "ConsumerIrManager is unavailable on this device.", null)
      if (!manager.hasIrEmitter()) {
        throw CodedException("ERR_NO_IR_EMITTER", "Device does not have an IR emitter.", null)
      }
      if (carrierFrequency <= 0) {
        throw CodedException("ERR_INVALID_FREQUENCY", "Carrier frequency must be positive.", null)
      }
      if (pattern.isEmpty() || pattern.any { it <= 0 }) {
        throw CodedException("ERR_INVALID_PATTERN", "IR pattern must be a non-empty list of positive integers.", null)
      }
      manager.transmit(carrierFrequency, pattern.toIntArray())
    }
  }
}
