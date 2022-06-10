import InternalErrorResult from '../../src/app/components/results/InternalErrorResult';
import NoItemResult from '../../src/app/components/results/NoItemResult';
import NotFoundResult from '../../src/app/components/results/NotFoundResult';

describe('NotFoundResult', () => {
    it('Rendering', () => {
        cy.mount(<NotFoundResult />);
        cy.get('.ant-result-title').should('have.text', 'common:errors:404:title');
        cy.get('.ant-result-subtitle').should('have.text', 'common:errors:404:description');
    });
});

describe('InternalErrorResult', () => {
    it('Rendering', () => {
        cy.mount(<InternalErrorResult />);
        cy.get('.ant-result-title').should('have.text', 'common:errors:500:title');
        cy.get('.ant-result-subtitle').should('have.text', 'common:errors:500:description');
    });
});

describe('NoItemResult', () => {
    it('Rendering', () => {
        cy.mount(<NoItemResult subTitle="test:dummy.subTitle" title="test:dummy.title" />);
        cy.get('.ant-result-title').should('have.text', 'test:dummy.title');
        cy.get('.ant-result-subtitle').should('have.text', 'test:dummy.subTitle');
    });
});
