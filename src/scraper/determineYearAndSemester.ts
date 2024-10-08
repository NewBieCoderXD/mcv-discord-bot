import { targetSemester, targetYear } from '../config/config'

export async function determineYearAndSemester($: cheerio.Root): Promise<void> {
  const currentYearAndSemester = $('h2').first().text()
  const split = /(\d+)\/(\d+)/.exec(currentYearAndSemester)
  if (split == undefined) {
    console.trace('error cannot parse year and semester: ', split)
    return
  }
  const [_beforeSplit, currentYear, currentSemester] = split
  targetYear.value = parseInt(currentYear)
  targetSemester.value = parseInt(currentSemester)
}
