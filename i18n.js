/*
 * Language handling for the whole site (English / German).
 *
 * Page content is written twice in the HTML, once per language:
 *     <p lang="en">Hello</p>  <p lang="de">Hallo</p>
 * and CSS hides whichever language is not active (see the .lang rules in each page).
 * Text that cannot be duplicated in markup (page title, aria-labels, alt texts,
 * meta description) is translated from the table below through data attributes:
 *     data-i18n-text, data-i18n-content, data-i18n-aria-label, data-i18n-alt
 *
 * Which language is shown, in order of priority:
 *   1. ?lang=en or ?lang=de in the URL (handy for links, e.g. the App Store privacy URL)
 *   2. the visitor's earlier choice with the EN/DE button (kept in localStorage)
 *   3. the browser / device language (German if it prefers German, otherwise English)
 */
(function () {
    var SUPPORTED = ['en', 'de'];
    var STORAGE_KEY = 'siteLanguage';

    var strings = {
        en: {
            menuOpen: 'Open menu',
            sendEmail: 'Send email',
            backHome: 'Back to home page',
            switchLanguage: 'Auf Deutsch anzeigen',
            profilePicture: 'Profile picture of Tobias Binkert',
            privacyDescription: 'Official website of Tobias Binkert. Information about apps, privacy and more.',
            tipsAlt: 'Tips Calculator iOS',
            tipQrAlt: 'QR code for Tip Calculator iOS app',
            tipScreenshotAlt: 'Screenshot of the Tip Calculator app',
            pcpQrAlt: 'QR code for Photo Card Pairs iOS app',
            pcpScreenshotAlt: 'Screenshot of the Photo Card Pairs app'
        },
        de: {
            menuOpen: 'Menü öffnen',
            sendEmail: 'E-Mail senden',
            backHome: 'Zurück zur Startseite',
            switchLanguage: 'Show in English',
            profilePicture: 'Profilbild von Tobias Binkert',
            privacyDescription: 'Offizielle Webseite von Tobias Binkert. Informationen über Apps, Datenschutz und mehr.',
            tipsAlt: 'Tip Calculator iOS',
            tipQrAlt: 'QR-Code für die Tip Calculator iOS App',
            tipScreenshotAlt: 'Screenshot der Tip Calculator App',
            pcpQrAlt: 'QR-Code für die Photo Card Pairs iOS App',
            pcpScreenshotAlt: 'Screenshot der Photo Card Pairs App'
        }
    };

    function readStored() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function store(language) {
        try { localStorage.setItem(STORAGE_KEY, language); } catch (e) { /* private mode: just don't remember */ }
    }

    function fromUrl() {
        var match = /[?&]lang=(en|de)(?:&|#|$)/i.exec(location.search);
        return match ? match[1].toLowerCase() : null;
    }

    function fromBrowser() {
        var preferred = (navigator.languages && navigator.languages.length)
            ? navigator.languages
            : [navigator.language || 'en'];
        for (var i = 0; i < preferred.length; i++) {
            var code = String(preferred[i]).toLowerCase().split('-')[0];
            if (SUPPORTED.indexOf(code) !== -1) return code;
        }
        return 'en';
    }

    function initialLanguage() {
        var requested = fromUrl();
        if (requested) {
            store(requested);
            return requested;
        }
        var saved = readStored();
        return SUPPORTED.indexOf(saved) !== -1 ? saved : fromBrowser();
    }

    function translateAttributes(language) {
        var table = strings[language];
        var targets = [
            ['data-i18n-text', function (el, value) { el.textContent = value; }],
            ['data-i18n-content', function (el, value) { el.setAttribute('content', value); }],
            ['data-i18n-aria-label', function (el, value) { el.setAttribute('aria-label', value); }],
            ['data-i18n-alt', function (el, value) { el.setAttribute('alt', value); }]
        ];
        targets.forEach(function (target) {
            var elements = document.querySelectorAll('[' + target[0] + ']');
            for (var i = 0; i < elements.length; i++) {
                var value = table[elements[i].getAttribute(target[0])];
                if (value !== undefined) target[1](elements[i], value);
            }
        });
        // Switch button announces and shows the language it switches to
        var buttons = document.querySelectorAll('.lang-button');
        for (var j = 0; j < buttons.length; j++) buttons[j].setAttribute('title', table.switchLanguage);
    }

    function apply(language) {
        document.documentElement.lang = language;
        if (document.readyState !== 'loading') translateAttributes(language);
    }

    window.toggleLanguage = function () {
        var next = document.documentElement.lang === 'de' ? 'en' : 'de';
        store(next);
        apply(next);
    };

    // Set the language before the page paints so there is no flash of the wrong one
    apply(initialLanguage());
    document.addEventListener('DOMContentLoaded', function () {
        translateAttributes(document.documentElement.lang);
    });
})();
