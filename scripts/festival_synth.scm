(load (path-append datadir "init.scm"))
(voice_cmu_us_slt_arctic_hts)
(Parameter.set 'Duration_Stretch 1.22)

(defvar seg-index 0)
(defvar out-dir "scripts/festival_parts")

(define (save_part utt)
  (set! seg-index (+ seg-index 1))
  (let ((base (string-append out-dir "/part" (format nil "%d" seg-index))))
    (utt.save.wave utt (string-append base ".wav"))
    (utt.save.segs utt (string-append base ".segs")))
  utt)

(set! tts_hooks (list utt.synth save_part))

(tts_file "scripts/narration.txt" nil)

(format t "Wrote %d parts\n" seg-index)
