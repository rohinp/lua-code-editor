from onnxruntime.quantization import quantize_dynamic, QuantType

quantize_dynamic("finetuned_codegen.onnx", "quantized_codegen.onnx", weight_type=QuantType.QInt8)
