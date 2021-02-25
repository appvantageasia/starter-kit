describe('My First Test', () => {
    it('Does not do much!', () => {
        cy.visit('/');
        cy.get('div.ant-layout-content').should('contain', 'ok');
    });
});
