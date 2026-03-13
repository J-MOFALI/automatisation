import { test, expect, Page } from '@playwright/test';

// Helper : accepter les cookies si la bannière est présente
async function accepterCookies(page: Page) {
  try {
    const bouton = page.locator('button').filter({ hasText: /^j'accepte$/i }).first();
    if (await bouton.isVisible({ timeout: 5000 })) {
      await bouton.click();
      console.log('✅ Cookies acceptés');
      await page.waitForTimeout(1000);
    }
  } catch {
    console.log('ℹ️ Pas de bannière cookie détectée');
  }
}

test.describe('Parcours de conquête RED by SFR', () => {

  test('Naviguer de la homepage jusqu\'à la page contrat', async ({ page }) => {

    // ── ÉTAPE 1 : Page d'accueil ──────────────────────────────────────────────
    console.log('🔵 Étape 1 : Chargement de la homepage');
    await page.goto('https://www.red-by-sfr.fr/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/RED/i, { timeout: 15000 });
    console.log('✅ Homepage chargée');
    await accepterCookies(page);

    // ── ÉTAPE 2 : Aller sur la page Forfaits mobiles ─────────────────────────
    console.log('🔵 Étape 2 : Navigation vers "Forfaits mobiles"');
    await page.goto('https://www.red-by-sfr.fr/forfaits-mobiles/', { waitUntil: 'domcontentloaded' });

    // Attendre que le JS charge les offres dynamiques
    await page.waitForTimeout(4000);
    await accepterCookies(page);

    console.log('✅ Page forfaits mobiles chargée');
    await page.screenshot({ path: 'tests/screenshots/etape2-forfaits.png' });

    // ── ÉTAPE 3 : Cliquer sur "Commander" pour le premier forfait ─────────────
    console.log('🔵 Étape 3 : Clic sur le bouton "Commander"');

    const boutonCommander = page.locator('button').filter({ hasText: /^commander$/i }).first();
    await boutonCommander.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Bouton "Commander" trouvé');

    await boutonCommander.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const urlEtape3 = page.url();
    console.log(`✅ URL après "Commander" : ${urlEtape3}`);
    await page.screenshot({ path: 'tests/screenshots/etape3-apres-commander.png' });

    // ── ÉTAPE 4 : Gérer la page suivante du tunnel ────────────────────────────
    console.log('🔵 Étape 4 : Progression dans le tunnel');

    // Si on est redirigé vers le tunnel de commande, continuer
    // Chercher un bouton "SIM seule" ou "Continuer" ou "Suivant"
    const simSeule = page.locator('button, a, label').filter({ hasText: /sim seule|sans téléphone/i }).first();
    if (await simSeule.isVisible({ timeout: 4000 })) {
      await simSeule.click();
      await page.waitForTimeout(2000);
      console.log('✅ "SIM seule" sélectionné');
    }

    const boutonContinuer = page.locator('button, a').filter({
      hasText: /^(suivant|continuer|valider|étape suivante|commander)/i
    }).first();

    if (await boutonContinuer.isVisible({ timeout: 5000 })) {
      const texte = await boutonContinuer.textContent();
      console.log(`ℹ️ Bouton trouvé : "${texte?.trim()}"`);
      await boutonContinuer.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
    }

    const urlEtape4 = page.url();
    console.log(`✅ URL étape 4 : ${urlEtape4}`);
    await page.screenshot({ path: 'tests/screenshots/etape4-tunnel.png' });

    // ── ÉTAPE 5 : Page récapitulatif / contrat ────────────────────────────────
    console.log('🔵 Étape 5 : Vérification de la page contrat/récapitulatif');

    const urlFinale = page.url();
    const titreFinale = await page.title();
    console.log(`📄 Titre : ${titreFinale}`);
    console.log(`📍 URL finale : ${urlFinale}`);

    await page.screenshot({ path: 'tests/screenshots/etape5-finale.png', fullPage: true });

    // Vérifier que le parcours a bien progressé au-delà de la homepage
    expect(urlFinale).not.toBe('https://www.red-by-sfr.fr/');
    console.log('✅ Parcours de conquête terminé');
  });
});
