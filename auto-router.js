/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2019 The Johns Hopkins University Applied Physics Laboratory LLC (JHU/APL).  All Rights Reserved.
//
// This material may be only be used, modified, or reproduced by or for the U.S. Government pursuant to the license
// rights granted under the clauses at DFARS 252.227-7013/7014 or FAR 52.227-14. For any other permission, please
// contact the Office of Technology Transfer at JHU/APL: Telephone: 443-778-2792, Internet: www.jhuapl.edu/ott
//
// NO WARRANTY, NO LIABILITY. THIS MATERIAL IS PROVIDED "AS IS." JHU/APL MAKES NO REPRESENTATION OR WARRANTY WITH
// RESPECT TO THE PERFORMANCE OF THE MATERIALS, INCLUDING THEIR SAFETY, EFFECTIVENESS, OR COMMERCIAL VIABILITY, AND
// DISCLAIMS ALL WARRANTIES IN THE MATERIAL, WHETHER EXPRESS OR IMPLIED, INCLUDING (BUT NOT LIMITED TO) ANY AND ALL
// IMPLIED WARRANTIES OF PERFORMANCE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF
// INTELLECTUAL PROPERTY OR OTHER THIRD PARTY RIGHTS. ANY USER OF THE MATERIAL ASSUMES THE ENTIRE RISK AND LIABILITY
// FOR USING THE MATERIAL. IN NO EVENT SHALL JHU/APL BE LIABLE TO ANY USER OF THE MATERIAL FOR ANY ACTUAL, INDIRECT,
// CONSEQUENTIAL, SPECIAL OR OTHER DAMAGES ARISING FROM THE USE OF, OR INABILITY TO USE, THE MATERIAL, INCLUDING,
// BUT NOT LIMITED TO, ANY DAMAGES FOR LOST PROFITS.
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const handler = require('./handler.js')

var consoleTest = false

/*
allServices -- array of objects that contain both 3 important properties: obj, id, and path
if path is NOT defined, the bkup.save will silently fail, which can be very convenient
*/

function exposeServices(allServices, basePath, app) {
    app.get(basePath, (req, res) => {
        var nextLevelCalls = []
        allServices.forEach(service => {
            nextLevelCalls.push(encodeURIComponent(service.id))
        })
        res.json(nextLevelCalls)
    })
}

function exposeSubServices(allServices, basePath, app) {
    /**
    Sends all the necessary calls for essentially entire pages
    */
    allServices.forEach(service => {
        app.get(basePath + encodeURIComponent(service.id), (req, res) => {
            var nextLevelCalls = []
            if (service.obj !== undefined) {
                Object.entries(service.obj).forEach(([key]) => {
                    nextLevelCalls.push(key)
                })
                res.json(nextLevelCalls)
            }
        })
    })

    /**
    Fills in the div elements
    <br> (client should probably also understand datastreams)
    */
    allServices.forEach(service => {
        console.debug(encodeURIComponent(service.id))
        if (service.obj !== undefined) {
            Object.entries(service.obj).forEach(([key]) => {
                app.get(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key), (req, res) => {
                    // console.debug('Getting '+key)
                    // console.debug(service.obj[key])
                    res.json(service.obj[key])
                })
            })
        }
    })
}

function exposeSubServiceFeatures(allServices, basePath, app) {
    exposeSubServiceFeatureGets(allServices, basePath, app)
    exposeSubServiceFeaturePosts(allServices, basePath, app)
}

function exposeSubServiceFeatureGets(allServices, basePath, app) {
    /**
    Sends data (from data sources) within div elements
    */
    allServices.forEach(service => {
        // console.debug('service: '+service.id)
        // console.debug(service)
        if (service.obj !== undefined) {
            Object.entries(service.obj).forEach(([key, value]) => {
                setupSpecificGETS(service, key, app, basePath)
                if (service.obj[key].datastreams !== undefined) {
                    setupDataStreaming(service, key, app, basePath)
                }
            })
        }
    })
}

function setupSpecificGETS(service, key, app, basePath) {
    Object.entries(service.obj[key]).forEach(([subkey, subvalue]) => {
        if (subvalue.type !== undefined) {
            if (subvalue.type[1] !== 'list') {
                console.debug(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subkey))
                app.get(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subkey), (req, res) => {
                    res.json(service.obj[key][subkey])
                })

            } else if (subvalue.type[1] === 'list') {
                /**
                Lists require more data
                */
                app.get(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subkey + 'list'), (req, res) => {
                    res.json(service.obj[key][subkey + 'list'])
                })
                app.get(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subkey), (req, res) => {
                    res.json(service.obj[key][subkey])
                })
            } else {
                console.debug('Unknown subvalue type:')
                console.debug(service.obj[key][subkey])
            }
        }
    })
}

function setupDataStreaming(service, key, app, basePath) {
    // console.debug('Intiailizing datastreams')

    // the datastreams 'get' might need to change
    // NOT SURE IF THIS IS USED??? In any event, it should probably be a streamable interface
    Object.entries(service.obj[key].datastreams).forEach(([subkey, subvalue]) => {
        app.get(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subkey), (req, res) => {
            res.json(service.obj[key][subkey])
        })
    })

    Object.entries(service.obj[key].updateable).forEach(([, subvalue]) => {
        app.get(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subvalue), (req, res) => {
            // subvalue in this case is the subkey, since updateable is an array
            res.json(service.obj[key][subvalue])
        })
    })
}

function exposeSubServiceFeaturePosts(allServices, basePath, app) {
    /**
    Receives data from a client via post for subkey (e.g. mfc/1/Set Point)
    */
    // console.debug(allServices[5].obj['1'].hidden.property.get('gasList'))
    allServices.forEach(service => {
        if (service.obj !== undefined) {
            Object.entries(service.obj).forEach(([key, value]) => {
                Object.entries(service.obj[key]).forEach(([subkey, subvalue]) => {
                    // console.debug('initializing api posts')
                    // console.debug(basePath+encodeURIComponent(service.id)+'/'+encodeURIComponent(key)+'/'+encodeURIComponent(subkey))
                    app.post(basePath + encodeURIComponent(service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subkey), (req, res, next) => {
                        // console.debug(req.params)
                        // console.debug(req)
                        var body = []
                        req.on('data', chunk => {
                            body.push(chunk)
                        }).on('end', () => {
                            console.debug((service.id) + '/' + encodeURIComponent(key) + '/' + encodeURIComponent(subkey))
                            if (subvalue.type[1] === 'file') {
                                body = Buffer.concat(body)
                            } else {
                                body = Buffer.concat(body).toString()
                                console.debug('Handling: ' + body)
                            }

                            handler.handlePost({
                                key: key,
                                value: value,
                                subkey: subkey,
                                subvalue: subvalue,
                                service: service,
                                body: body,
                                res: res,
                                basePath: basePath,
                                generateNewRoutes: module.exports.generateRoutes,
                                app: app,
                            })
                        })
                    })
                })
            })
        }
    })
}

var basePaths = []

module.exports = {
    generateRoutes: (allServices, basePath, app) => {
        // if (basePaths.includes(basePath)) return // do not over-write existing routes
        // basePaths.push(basePath)
        exposeServices(allServices, basePath, app)
        exposeSubServices(allServices, basePath, app)
        exposeSubServiceFeatures(allServices, basePath, app)
        return handler.handlePost
    }
}