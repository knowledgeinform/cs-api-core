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

const express = require('express')
const expressSetup = require('./express-setup.js')
const autoRouter = require('./auto-router.js')
const initializer = require('./initializer.js')
const {post} = require('./postman.js')
const timers = require('@qlc/cs-timers')
const configManager = require('@qlc/cs-config-manager')

class CoreAPI {
    constructor({ipAddress = 'localhost', port = 3000, testFlag = false, baseAPIPath = '/api/', staticLocation = 'node_modules/@qlc/cs-gui'}) {
        this.ipAddress = ipAddress
        this.port = port
        this.url = this.generateURL({ipAddress: this.ipAddress, port: this.port})
        this.testFlag = testFlag
        this.baseAPIPath = baseAPIPath
        this.whitelist = [this.url]
        this.app = express()
        this.staticLocation = staticLocation
        expressSetup.setup(this.app, this)
        this.baseServices = [] // array of api-friendly objects
        expressSetup.prependAPIURL(this.url, this.staticLocation)
    }

    generateURL({ipAddress, port}) {
        return 'http://' + ipAddress.toString() + ':' + port.toString()
    }

    addToWhitelist(str) {
        // any more CORS operations should probably get re-factored into their own script
        this.whitelist.push(str)
    }

    async reinitialize() {
        await this.initialize() // initializeUtilities is now inherited by initialize, since they've been added to the baseServices array
        this.generateAPI(this.baseAPIPath)
    }

    async initialize() {
        try {
            await initializer.initializeServices(this.testFlag, this)
        } catch (error) {
            console.debug('init error')
            console.debug(error)
        }
    }

    async initializeUtilities() {
        try {
            var configDefaults = { 'Default': {}}
            configManager.defaults(configDefaults, this, this.testFlag)
            await configManager.initialize({testFlag: this.testFlag, parent: this})

            var timerDefaults = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }
            timers.defaults(timerDefaults, this, this.testFlag)
            await timers.initialize({testFlag: this.testFlag, parent: this})
        } catch (error) {
            console.debug('init error')
            console.debug(error)
        }
    }

    generateAPI(basePath) {
        console.debug(this.originalStack)
        console.debug(this.app._router.stack)
        if (this.originalStack) {
            this.app._router.stack = []
            this.originalStack.forEach(layer => {
                this.app._router.stack.push(layer)
            });
        } else {
            this.originalStack = []
            this.app._router.stack.forEach(layer => {
                this.originalStack.push(layer)
            });
        }
        this.handlePost = autoRouter.generateRoutes(this.baseServices, basePath, this.app)
        console.debug('After autorouter')
        console.debug(this.app._router.stack)
        console.debug('this.originalStack')
        console.debug(this.originalStack)
    }

    postVal(call, value) {
        post(this, call, value)
    }

    start() {
        this.generateAPI(this.baseAPIPath)
        this.app.listen(this.port, this.ipAddress, error => {
            if (error) {
                throw new Error('something bad happened', error)
            }

            console.debug(`Server running at http://${this.ipAddress}:${this.port}`)
            // console.debug(this.app._router.stack[10])
        })
    }
}

module.exports = {
    CoreAPI: CoreAPI
}
