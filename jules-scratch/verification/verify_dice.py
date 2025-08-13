import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        current_dir = os.getcwd()
        file_path = os.path.join(current_dir, 'index.html')
        url = f'file://{file_path}'

        page.goto(url)

        roll_button = page.locator("#rollButton")

        # Click 1
        roll_button.click()
        expect(page.locator("#launchNumber")).to_have_text("1")
        result1_text = page.locator("#result").inner_text()
        result1 = int(result1_text)
        assert 2 <= result1 <= 3

        # Click 2
        roll_button.click()
        expect(page.locator("#launchNumber")).to_have_text("2")
        result2_text = page.locator("#result").inner_text()
        result2 = int(result2_text)
        assert 4 <= result2 <= 6

        # Click 3
        roll_button.click()
        expect(page.locator("#launchNumber")).to_have_text("3")
        result3_text = page.locator("#result").inner_text()
        result3 = int(result3_text)
        assert 7 <= result3 <= 9

        # Click 4
        roll_button.click()
        expect(page.locator("#launchNumber")).to_have_text("4")
        result4_text = page.locator("#result").inner_text()
        result4 = int(result4_text)
        assert 10 <= result4 <= 12

        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
