import Foundation
import AVFoundation
let root=URL(fileURLWithPath:CommandLine.arguments[1])
let picture=AVURLAsset(url:root.appendingPathComponent("traffic-silent.mp4"))
let sound=AVURLAsset(url:root.appendingPathComponent("traffic-ambience.wav"))
let timeline=AVMutableComposition()
let range=CMTimeRange(start:.zero,duration:CMTime(seconds:10,preferredTimescale:600))
let v=timeline.addMutableTrack(withMediaType:.video,preferredTrackID:kCMPersistentTrackID_Invalid)!
try v.insertTimeRange(range,of:picture.tracks(withMediaType:.video)[0],at:.zero)
let a=timeline.addMutableTrack(withMediaType:.audio,preferredTrackID:kCMPersistentTrackID_Invalid)!
try a.insertTimeRange(range,of:sound.tracks(withMediaType:.audio)[0],at:.zero)
let out=root.appendingPathComponent("traffic-immersive.mp4")
if FileManager.default.fileExists(atPath:out.path){try FileManager.default.removeItem(at:out)}
let export=AVAssetExportSession(asset:timeline,presetName:AVAssetExportPresetHighestQuality)!
export.outputURL=out;export.outputFileType = .mp4;export.shouldOptimizeForNetworkUse=true
let done=DispatchSemaphore(value:0)
export.exportAsynchronously{done.signal()};done.wait()
guard export.status == .completed else {throw export.error!}
let check=AVURLAsset(url:out)
print(out.path, "duration",CMTimeGetSeconds(check.duration),"audio tracks",check.tracks(withMediaType:.audio).count)
