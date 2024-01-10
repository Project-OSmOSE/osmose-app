describe("osmose-campaign-creation", () => {
  beforeEach(() => {
    cy.login("admin", "osmose29")
    cy.visit('http://localhost:5173/')
  })

  it("tests osmose-campaign-creation", () => {
    let campaignName = "TestCampaign-" + crypto.randomUUID();;

    // Campaign creation
    cy.get("a").contains("Annotation campaigns").click();
    cy.get(".btn").contains("New annotation campaign").click();
    cy.get("#cac-name").type(campaignName);
    cy.get("#cac-desc").type("Testing campaign creation");
    cy.get("#cac-dataset").select(1);
    cy.get("#cac-spectro").select("4096_4096_90");
    cy.get("#cac-annotation-set").select("Test SPM campaign");
    cy.get("#cac-confidence-indicator-set").select("Confident/NotConfident");
    cy.get("#cac-annotation-mode").select("Whole file");
    cy.get("#cac-user").select("admin@osmose.xyz");
    cy.get("#cac-user").select(1);
    cy.get("#cac-user").select(1);
    cy.get("#cac-annotation-method").select("Sequential");
    cy.get(".btn").contains("Submit").click();

    // Let's test a task quickly
    cy.get("tr").contains(campaignName).parent().parent().within(() => {
      cy.get("a").contains("My tasks").click();
    });
    // cy.get("tr").contains(campaignName).get("a").contains("My tasks").click();
    cy.get("tr").contains("sound005.wav").get("a").contains("Task link").click();
    cy.viewport(1990, 1331); // Let's have some room

    // ISSUE : selecting an annotation in presence / absence is not working correctly
    // Clicking seems to open the confirmation modal of deletion (is there a double click?)
    // Other options don't seem to work on CI (to be re-tested)
    cy.get(".card").contains("Presence / Absence").get("li:nth-of-type(3) > label"); //.click();
    //cy.get(".card").contains("Presence / Absence").get("li:nth-of-type(3) > [type='checkbox']").check();
    //cy.get(".card").contains("Presence / Absence").get("li:nth-of-type(5) > label"); //.click();

    // Tried making an annotation, does not work yet unfortunately
    // See https://github.com/cypress-io/cypress-example-recipes/issues/173 for more ideas
    cy.get("canvas.canvas").trigger("pointerdown", 100, 100, { button: 0 , force: true });
    cy.get("canvas.canvas").trigger("pointerup", 300, 300, { force: true });

    // Let's submit and come back
    //cy.get("table").contains("Annotations").get('tr').should('have.length', 3); // With extra annotations this number should be higher
    cy.get(".btn").contains("Submit & load next recording").click();
    cy.get("table").contains("Annotations").get('tr').should('have.length', 1);
    cy.get(".btn > i.fa-caret-left").click();
    //cy.get("table").contains("Annotations").get('tr').should('have.length', 3);

    // TODO some of this does not work correctly, selecting presence tags in particular ?
  });
});
