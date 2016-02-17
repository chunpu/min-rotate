var debug = require('debug')('min-rotate')
var fs = require('mz/fs')
var spawn = require('mz/child_process').spawn
var _ = require('lodash')
var async = require('async')
var glob = require('glob')
var moment = require('moment')

var ASYNC_LIMIT = 4

function Rotate(config) {
	this.initConfig(config)
	this.run() // 一次性的
}

var proto = Rotate.prototype

proto.initConfig = function() {
	// read last rotate file
}

proto.run = function() {
	var me = this
	var config = me.config
	glob(config.file, function(err, files) {
		async.filterLimit(files, ASYNC_LIMIT, function(file, cb) {
			me.shouldRotate(file).then(function(val) {
				cb(null, val)
			})
		}, function(err, files2rotate) {
			// TODO sync last rotate
			me.renamedFiles = files2rotate.map(function(file) {
				return me.renameFile(file)
			})
		})
	})
}

proto.renameFile = function(filename) {
	var now = moment()
	var arr = [filename, rotate, now.format('YYYYMMDD'), now.format('HHMM')]
	return arr.join('-')
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
