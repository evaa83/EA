import Foundation
import AVFoundation
import AppKit
import CoreVideo

let root = URL(fileURLWithPath: CommandLine.arguments[1])
let width = 1280, height = 720, fps: Int32 = 24
func image(_ name: String) -> CGImage {
    let url = root.appendingPathComponent(name + ".png")
    return NSImage(contentsOf: url)!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
}
func render(_ name: String, scenes: [(String, Double)]) throws {
    let output = root.appendingPathComponent(name + ".mp4")
    if FileManager.default.fileExists(atPath: output.path) { try FileManager.default.removeItem(at: output) }
    let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: width, AVVideoHeightKey: height, AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 2400000]])
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: width, kCVPixelBufferHeightKey as String: height, kCVPixelBufferCGImageCompatibilityKey as String: true, kCVPixelBufferCGBitmapContextCompatibilityKey as String: true])
    writer.add(input)
    guard writer.startWriting() else { throw writer.error! }
    writer.startSession(atSourceTime: .zero)
    let images = scenes.map { image($0.0) }
    let frames = Int(scenes.reduce(0) { $0 + $1.1 } * Double(fps))
    func draw(_ img: CGImage, _ progress: Double, _ context: CGContext, _ alpha: Double) {
        let scale = max(Double(width)/Double(img.width), Double(height)/Double(img.height)) * (1.02 + progress * 0.055)
        let w = Double(img.width)*scale, h = Double(img.height)*scale
        context.setAlpha(alpha)
        context.draw(img, in: CGRect(x: (Double(width)-w)/2 - progress*8, y: (Double(height)-h)/2, width: w, height: h))
    }
    for frame in 0..<frames {
        while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
        autoreleasepool {
            let t = Double(frame)/Double(fps)
            var start = 0.0, idx = 0
            while idx < scenes.count-1 && t >= start + scenes[idx].1 { start += scenes[idx].1; idx += 1 }
            let local = t-start
            var buffer: CVPixelBuffer?
            CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &buffer)
            let b = buffer!
            CVPixelBufferLockBaseAddress(b, [])
            let c = CGContext(data: CVPixelBufferGetBaseAddress(b), width: width, height: height, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(b), space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
            c.setFillColor(NSColor.black.cgColor); c.fill(CGRect(x: 0,y: 0,width: width,height: height))
            if idx > 0 && local < 0.4 {
                draw(images[idx-1], 1, c, 1)
                draw(images[idx], local/scenes[idx].1, c, local/0.4)
            } else { draw(images[idx], local/scenes[idx].1, c, 1) }
            CVPixelBufferUnlockBaseAddress(b, [])
            adaptor.append(b, withPresentationTime: CMTime(value: Int64(frame), timescale: fps))
        }
    }
    input.markAsFinished()
    let done = DispatchSemaphore(value: 0)
    writer.finishWriting { done.signal() }; done.wait()
    guard writer.status == .completed else { throw writer.error! }
    print(output.path)
}
try render("train-stove", scenes: [("train",4),("stove",2.5),("train",3.5)])
try render("home-chores", scenes: [("sink",5),("sofa",5)])
