/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2019 The Johns Hopkins University Applied Physics Laboratory LLC (JHU/APL).  All Rights Reserved.
//
// This material may be only be used, modified, or reproduced by or for the U.S. Government pursuant to the license
// rights granted under the clauses at DFARS 252.227-7013/7014 or FAR 52.227-14. For any other permission, please
// contact the Office of Technology Transfer at JHU/APL: Telephone: 443-778-2792, Internet: www.jhuapl.edu/ott
//
// NO WARRANTY, NO LIABILITY. THIS MATERIAL IS PROVIDED 'AS IS.' JHU/APL MAKES NO REPRESENTATION OR WARRANTY WITH
// RESPECT TO THE PERFORMANCE OF THE MATERIALS, INCLUDING THEIR SAFETY, EFFECTIVENESS, OR COMMERCIAL VIABILITY, AND
// DISCLAIMS ALL WARRANTIES IN THE MATERIAL, WHETHER EXPRESS OR IMPLIED, INCLUDING (BUT NOT LIMITED TO) ANY AND ALL
// IMPLIED WARRANTIES OF PERFORMANCE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF
// INTELLECTUAL PROPERTY OR OTHER THIRD PARTY RIGHTS. ANY USER OF THE MATERIAL ASSUMES THE ENTIRE RISK AND LIABILITY
// FOR USING THE MATERIAL. IN NO EVENT SHALL JHU/APL BE LIABLE TO ANY USER OF THE MATERIAL FOR ANY ACTUAL, INDIRECT,
// CONSEQUENTIAL, SPECIAL OR OTHER DAMAGES ARISING FROM THE USE OF, OR INABILITY TO USE, THE MATERIAL, INCLUDING,
// BUT NOT LIMITED TO, ANY DAMAGES FOR LOST PROFITS.
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const path = require('path')
const csdt = require('@qlc/cs-datatypes')
const { GeneralAPIObject, deleted, GeneralInterface } = require('@qlc/cs-api-object')
const bkup = require('@qlc/cs-backup')

var configPath

class Device {
    constructor(settings, ID) {
        this.binary = false
        this.number = -7
        this.string = 'Hello'
        this.api = settings.api
        this.items = ['one', 'two', 'three']
        this.item = this.items[0]
        this.datapoint = new csdt.DataPoint({value: 7, units: 'efgh'})
        this.Properties = {
            ID: new csdt.ShowUser({value: ID}),
            Something: new csdt.ShowUser({value: 'testing'}),
            Something2: new csdt.ShowUser({value: 1, type: ['output', 'number']}),
        }
    }
}

class TestC extends GeneralAPIObject {
    constructor(settings) {
        super(settings)

        Object.defineProperty(this, 'device', {
            writable: true,
            value: new Device(settings, this.ID.value)
        })

        this.addAnyMoreProperties()

        Object.defineProperty(this, 'Binary', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: this.device.binary, type: ['output', 'binary'] })
            },
            set: val => {
                this.device.binary = val
            }
        })

        Object.defineProperty(this, 'Number', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: this.device.number, type: ['output', 'number'] })
            },
            set: val => {
                this.device.number = val
            }
        })

        Object.defineProperty(this, 'String', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: this.device.string, type: ['output', 'string'] })
            },
            set: val => {
                this.device.string = val
            }
        })

        // Highlight the fact that the ID will create a new device
        // Highlight the fact that "Reinitialize" will re-instantiate 
        // make sure the user has a way to download and save/upload some config files
        // possibly do versioning
        // configuration "service" for saving (downloading) and uploading configuration settings
        // ensure that Status does cover *errors*

        // look for sequential steps and checkboxes to add a new service

        // logging of Status's (making it accessible) (USE THE ACTUAL LOG LEVELS CORRECTLY FOR CONSOLE)

        // Object.defineProperty(this, 'Reinitialize API', {
        //     enumerable: true,
        //     get: () => {
        //         return (new csdt.ShowUser({ value: new csdt.Action({ name: 'post', data: '' }), type: ['output', 'button'] }))
        //     },
        //     set: ({ res }) => {
        //         res.json({ type: ['nothing'] })
        //         console.log(this.device.api)
        //         this.device.api.initialize().then(() => {
        //             this.device.api.generateAPI(this.device.api.baseAPIPath)
        //         }).catch(e => {
        //             console.debug('Reinitialize error')
        //             console.debug(e)
        //         })
        //     },
        // })

        Object.defineProperty(this, 'Binary_i', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: Math.round(Math.random()) == 1, type: ['input', 'binary'] })
            },
        })

        Object.defineProperty(this, 'Number_i', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: Math.random() * 100, type: ['input', 'number'] })
            },
        })

        Object.defineProperty(this, 'String_i', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: Math.random().toString(36), type: ['input', 'string'] })
            },
        })

        Object.defineProperty(this, 'Some', {
            enumerable: true,
            get: () => {
                return (new csdt.ShowUser({ value: this.device.item, type: ['output', 'list'] }))
            },
            set: val => {
                this.device.item = val
            },
        })
        Object.defineProperty(this, 'Somelist', {
            get: () => {
                return this.device.items
            },
        })

        Object.defineProperty(this, 'Datapoint', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: this.device.datapoint, type: ['output', 'datapoint'] })
            },
            set: val => {
                this.device.datapoint.time = Date.now()
                this.device.datapoint.value = val
            }
        })

        Object.defineProperty(this, 'Datapoint_i', {
            enumerable: true,
            get: () => {
                return new csdt.ShowUser({ value: new csdt.DataPoint({value: Math.random() * 100, units: 'abcd'}), type: ['input', 'datapoint'] })
            },
        })

        this.Properties = new csdt.ShowUser({
            value: [{
              id: 'Settings',
              obj: {0: this.device.Properties},
              path: settings.configPath + '/Database/',
            }],
            type: ['output', 'link'],
          })
    }

    async initialize() {
        console.debug('test object initialized')
    }
}

module.exports = new GeneralInterface({service: 'Test', interfaceClass: TestC})