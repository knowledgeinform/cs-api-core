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

const bkup = require('@qlc/cs-backup')
const csdt = require('@qlc/cs-datatypes')

module.exports = {
    handle: ({service, key, subkey, body, res}) => {
        if (typeof service.obj[key][subkey].value.value === 'number') {
            console.debug('datapoint number found')
            if (csdt.isSetter(service.obj[key], subkey)) {
              console.debug('setter', body)
              try {
                service.obj[key][subkey] = JSON.parse(body)
              } catch (error) {
                console.log('Error',error)
                return res.status(500).send({
                  message: 'datapoint parse failed ' + error.toString(),
                })
              }
            } else {
              console.debug('not setter')
              service.obj[key][subkey].value.value = parseFloat(body)
            }
            bkup.save(service.obj[key], service.path)
            res.send()
        } else if (typeof service.obj[key][subkey].value.value === 'string') {
            console.debug('datapoint string found')
            service.obj[key][subkey] = body
            bkup.save(service.obj[key], service.path)
            res.send()
        } else {
            console.debug('Unknown data point type')
            console.debug(service.obj[key][subkey])
            return res.status(400).send({
                message: 'Unknown data point type',
            })
        }
    }
}