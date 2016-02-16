var debug = require('debug')('min-rotate')
var fs = require('mz/fs')
var spawn = require('mz/child_process').spawn

function Rotate(config) {
	this.initConfig(config)
	this.run() // 一次性的
}

var proto = Rotate.prototype

proto.initConfig = function() {
	// read last rotate file
}

proto.run = function() {
}

proto.shouldRotate = function(filename) {
	// filename 是完整路径
	var me = this
	var config = me.config
	return fs.stat(filename).then(function(stat) {
		var size = stat.size
		if (size > config.maxsize) {
			return true
		}
		if (size < config.minsize) {
			return false
		}
		var lastRotate = me.lastRotate[filename]
		if (lastRotate && _.now() - lastRotate < config.interval) {
			return false
		}
		return true
	})
}
