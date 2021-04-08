function createSound(buffer, context) {
    var sourceNode = null,
        startedAt = 0,
        pausedAt = 0,
        playing = false;

    var play = function() {
        var offset = pausedAt;

        sourceNode = context.createBufferSource();
        sourceNode.connect(context.destination);
        sourceNode.buffer = buffer;
        sourceNode.start(0, offset);

        startedAt = context.currentTime - offset;
        pausedAt = 0;
        playing = true;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        stop();
        pausedAt = elapsed;
    };

    var stop = function() {
        if (sourceNode) {          
            sourceNode.disconnect();
            sourceNode.stop(0);
            sourceNode = null;
        }
        pausedAt = 0;
        startedAt = 0;
        playing = false;
    };

    var getPlaying = function() {
        return playing;
    };

    var getCurrentTime = function() {
        if(pausedAt) {
            return pausedAt;
        }
        if(startedAt) {
            return context.currentTime - startedAt;
        }
        return 0;
    };

    var getDuration = function() {
      return buffer.duration;
    };

    return {
        getCurrentTime: getCurrentTime,
        getDuration: getDuration,
        getPlaying: getPlaying,
        play: play,
        pause: pause,
        stop: stop
    };
}