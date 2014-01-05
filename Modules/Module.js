var Module = function (logWriter, mongoose, profile, models) {
    var moduleSchema = mongoose.Schema({
        _id: Number,
        mname: String,
        href: { type: String, default: '' },
        ancestors: [Number],
        users: {},
        parrent: Number,
        link: Boolean,
        visible: Boolean
    }, { collection: 'modules' });
    
    var ObjectId = mongoose.Schema.Types.ObjectId;
    
    //var _module = mongoose.model('modules', moduleSchema);

    return {
        create: function (data, func) {
            var testmmodule = new _module();
            testmmodule._id = data._id;
            testmmodule.mname = data.mname;
            testmmodule.ancestors = data.ancestors;
            testmmodule.users = data.users;
            testmmodule.parrent = data.parrent;
            testmmodule.link = data.link;
            testmmodule.save(function (err, res) {
                if (err) {
                    console.log(err);
                    logWriter.log(err);
                } else {
                    console.log('Save is success');
                    func(res);
                }
            });
        },//End create

        get: function (req, id, response) {
           
            var res = [];
            models.get(req.session.lastDb - 1, "Profile", profile.schema).aggregate(
                {
                    $project: {
                        profileAccess: 1
                    }
                },
                {
                    $match: {
                        _id: id
                    }
                },
                {
                    $unwind: "$profileAccess"
                },

                {
                    $match: {
                        'profileAccess.access.read': true
                    }
                },
                { $group: { _id: "$profileAccess.module" } },

                function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                        models.get(0, "modules", moduleSchema).find().
                            where('_id').in(result).
                            where({ visible: true }).
                            sort({ sequence: 1 }).
                            exec(function (err, mod) {
                                if (mod) {
                                    console.log(mod);
                                    response.send(mod);
                                } else {
                                    console.log("Node JS error " + err);
                                    response.send(401);
                                }
                            });
                    }
                }
            );
        },

        update: function (func) {
            _module.find({}, function (err, modules) {
                if (!err) {
                    console.log(modules);
                    upMod(0, modules);
                } else {
                    console.log(err);
                    logWriter.log(err);
                }
            });

            function toHref(str) {
                str.trim();
                var arr = str.split(' ');
                var s = '';
                for (var i in arr) {
                    s += arr[i];
                }
                return s.toLowerCase();
            }

            var upMod = function (count, modules) {
                if (!(count === (modules.length - 1))) {
                    var value = toHref(modules[count].mname);
                    _module.update({ _id: modules[count]._id }, { $set: { href: value } }, function (err, res) {
                        if (!err) {
                            console.log(res);
                            count++;
                            upMod(count, modules);
                        } else {
                            console.log(err);
                            logWriter.log(err);
                            func(false);
                        }
                    });
                } else {
                    func(true);
                }

            }

        }
    };
}

module.exports = Module;