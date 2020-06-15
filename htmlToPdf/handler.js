import pdf from 'html-pdf'
import handlebars from 'handlebars'
import AWS from 'aws-sdk'

process.env.PATH = `${process.env.PATH}:/opt`
process.env.FONTCONFIG_PATH = '/opt'
process.env.LD_LIBRARY_PATH = '/opt'

export const htmlToPdf = async event => {
    try {
        // Initialize s3 Object
        const s3 = new AWS.S3();
        // Define the bucket to use
        let Bucket = process.env.S3_BUCKET
        // path to sample html file stored in s3
        let Key = `html/sample.html`

        // hardcode the HTML string
        // let html = `<h1>This is a example to convert html to LUCAS</h1><br /><b>{{template}}</b>`
        // const data = JSON.parse(event.body)
        // OR get the html file from s3
        // let { Body } = await s3.getObject({ Bucket, Key }).promise()
        // // Body will be a buffer type so need to convert it to string before converting to pdf
        // html = Body.toString()

        // OR get the HTML string from request body
        // html = event.body.html

        // To generate HTML with dynamic data there are some popular template engines 
        // like hbs, pug, Mustache, ejs, etc.
        // For list of template engines visit https://github.com/expressjs/express/wiki#template-engines 
        // In this example we will be using handlebars(hbs)
//lucas
        let html = await getHTML('nani')
//lucas

        html = handlebars.compile(html)(event.body)

        let file = await exportHtmlToPdf(html)
        // path where sample.pdf file will stored in s3
        Key = event.body.filename
        return await s3.putObject({ Bucket, Key, Body: file }).promise()
    } catch (error) {
        return error
    }
}

/**
 * 
 * @param {string} html 
 * takes html string as input and convert it into Buffer
 */
const exportHtmlToPdf = html => {
    return new Promise((resolve, reject) => {
        pdf.create(html, {
            format: "Letter",
            orientation: "portrait",
            // This is the path for compiled phantomjs executable stored in layer.
            // To test locally comment out the following line.
           phantomPath: '/opt/phantomjs_linux-x86_64'
        }).toBuffer((err, buffer) => {
            if (err) {
                reject(err)
            } else {
                resolve(buffer)
            }
        });
    })
}

const getHTML = a => {
    var r = `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>invoice</title>
        
        <style>
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, .15);
            font-size: 16px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
        }
        
        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
        }
        
        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }
        
        .invoice-box table tr td:nth-child(2) {
            text-align: right;
        }
        
        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }
        
        .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }
        
        .invoice-box table tr.information table td {
            padding-bottom: 40px;
        }
        
        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }
        
        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }
        
        .invoice-box table tr.item td{
            border-bottom: 1px solid #eee;
        }
        
        .invoice-box table tr.item.last td {
            border-bottom: none;
        }
        
        .invoice-box table tr.total td:nth-child(3) {
            border-top: 2px solid #eee;
        }
        .imagen{
            max-width: 300px;
            max-height: 100px;
        }
        
        @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td {
                width: 100%;
                display: block;
                text-align: center;
            }
            
            .invoice-box table tr.information table td {
                width: 100%;
                display: block;
                text-align: center;
            }
        }
        
        /** RTL **/
        .rtl {
            direction: rtl;
            font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
        }
        
        .rtl table {
            text-align: right;
        }
        
        .rtl table tr td:nth-child(2) {
            text-align: left;
        }
        </style>
    </head>
    
    <body>
        <div class="invoice-box">
            <table cellpadding="0" cellspacing="0">
                <tr class="top">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td class="title">
                                    {{#if from.logo}}
                                        <img class="imagen" src={{from.logo}}>
                                    {{/if}}
                                </td>
                                
                                <td>
                                    Numero: {{nserie}} / {{numeroFactura}}<br>
                                    Fecha: {{fecha}} 
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <tr class="information">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td>
                                        {{from.nombreFantasia}} <br />
                                        {{from.nombre}} <br />
                                        {{from.ciudad}} <br />
                                        {{from.direccion}} <br />
                                        {{from.email}} <br />
                                </td>
                                
                                <td>
                                    {{to.nombreFantasia}} <br />
                                    {{to.nombre}} <br />
                                    {{to.localidad}} <br />
                                    {{to.direccion}} <br />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
            </table>
    <table cellpadding="0" cellspacing="0">
        <tr class="heading">
            <td style="width: 15%;">
            Cantidad
            </td>
            <td style="text-align:left">
            Descripción
            </td>
            <td style="text-align:center;width: 15%;">
            Precio
            </td>
            <td style="text-align:right;width: 15%;">
            Total
            </td>
        </tr>

        {{#each items}}
            <tr class="item">
                <td>
                {{this.cantidad}}
                </td>
                <td style="text-align:left">
                {{this.descripcion}}
                </td>
                <td style="text-align:center">
                {{this.precio}}
                </td>
                <td style="text-align:right">
                {{this.total}}
                </td>
            </tr>
         {{/each}}

            
        
        <tr class="total">
                    <td></td>
                    <td></td>

                    
                    <td style="text-align:right" colspan="2">
                       Total: € {{totalSinIva}} <br />
                       IVA: € {{ivaTotal}} <br />
                     <b>Final: € {{totalConIva}}</b>
                    </td>
                </tr>
    </table>
        </div>
    </body>
    </html>
    `
    return r
}
