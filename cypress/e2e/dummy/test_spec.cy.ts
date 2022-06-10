describe('My First Test', () => {
    it('Does not do much!', () => {
        cy.visit('/');
        cy.get('main.ant-layout-content').should('contain', 'Welcome');
    });
});
