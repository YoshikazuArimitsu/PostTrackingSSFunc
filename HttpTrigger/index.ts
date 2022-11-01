import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { chromium } from "playwright-chromium"
import { promises as fs } from "fs"
import { exec } from "child_process"
import * as util from "util"

const execAsync = util.promisify(exec);

const fontUpdate = async () => {
    const fontPath = process.env.FONT_PATH || '/home/.fonts';
    try {
        await fs.stat(fontPath);
        return
    } catch {
    }

    // ln -s /home/site/wwwroot/fonts $FONT_PATH
    await execAsync(`ln -s /home/site/wwwroot/fonts ${fontPath}`);
}

// https://github.com/horihiro/azure-functions-puppeteer-node-cjkfont
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        await fontUpdate();

        const url = req.query.url || `https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${req.query.request_no}&requestNo2=&requestNo3=&requestNo4=&requestNo5=&requestNo6=&requestNo7=&requestNo8=&requestNo9=&requestNo10=&search.x=65&search.y=21&startingUrlPatten=&locale=ja`;
        const browser =  await chromium.launch();
        const page = await browser.newPage();
        await page.goto(url);

        if(req.query.format === "pdf") {
            // PDF取得 ( ?format=pdf 時のみ)
            const path = '/tmp/screenshot.pdf'
            await page.pdf({ path: path })
            await browser.close()

            const content = await fs.readFile(path)
            context.res = {
                body: content,
                headers: {
                    "content-type": "application/pdf"
                }
            }
        } else {
            // PNG
            const screenshotBuffer = await page.screenshot({ fullPage: true });
            await browser.close();
        
            context.res = {
                body: screenshotBuffer,
                headers: {
                    "content-type": "image/png"
                }
            };
        }
    } catch (e) {
        context.res = {
            status: 500,
            body: `error: ${e}`,
          };
    }
};

export default httpTrigger;