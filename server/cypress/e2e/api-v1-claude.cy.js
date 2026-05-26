const baseUrl = Cypress.env('apiUrl')

describe('GET /customers', () => {
  describe('Comportamento padrão (sem parâmetros de consulta)', () => {
    it('retorna status 200 e a estrutura correta da resposta', () => {
      cy.request('GET', `${baseUrl}/customers`)
        .then(({ status, body }) => {
          const { customers, pageInfo } = body
          expect(status).to.eq(200)
          expect(customers).to.be.an('array')
          expect(pageInfo).to.have.keys(['currentPage', 'totalPages', 'totalCustomers'])
        })
    })

    it('retorna a página 1 e o limite de 10 clientes por padrão', () => {
      cy.request('GET', `${baseUrl}/customers`)
        .then(({ body }) => {
          const { customers, pageInfo } = body
          expect(pageInfo.currentPage).to.eq(1)
          expect(customers.length).to.be.lte(10)
        })
    })
  })

  describe('Paginação', () => {
    it('retorna a página correta quando o parâmetro page é informado', () => {
      cy.request('GET', `${baseUrl}/customers?page=2`)
        .then(({ status, body }) => {
          const { pageInfo } = body
          expect(status).to.eq(200)
          expect(pageInfo.currentPage).to.eq(2)
        })
    })

    it('retorna a quantidade correta de clientes quando o parâmetro limit é informado', () => {
      cy.request('GET', `${baseUrl}/customers?limit=5`)
        .then(({ status, body }) => {
          const { customers } = body
          expect(status).to.eq(200)
          expect(customers.length).to.be.lte(5)
        })
    })

    it('retorna a página e o limite corretos quando ambos os parâmetros são informados', () => {
      cy.request('GET', `${baseUrl}/customers?page=2&limit=5`)
        .then(({ status, body }) => {
          const { customers, pageInfo } = body
          expect(status).to.eq(200)
          expect(pageInfo.currentPage).to.eq(2)
          expect(customers.length).to.be.lte(5)
        })
    })
  })

  describe('Filtro por porte', () => {
    const sizes = ['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise']

    sizes.forEach((size) => {
      it(`retorna apenas clientes do porte "${size}" quando o parâmetro size é informado`, () => {
        cy.request('GET', `${baseUrl}/customers?size=${encodeURIComponent(size)}`)
          .then(({ status, body }) => {
            const { customers } = body
            expect(status).to.eq(200)
            customers.forEach(({ size: customerSize }) => {
              expect(customerSize).to.eq(size)
            })
          })
      })
    })
  })

  describe('Filtro por setor', () => {
    const industries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance']

    industries.forEach((industry) => {
      it(`retorna apenas clientes do setor "${industry}" quando o parâmetro industry é informado`, () => {
        cy.request('GET', `${baseUrl}/customers?industry=${industry}`)
          .then(({ status, body }) => {
            const { customers } = body
            expect(status).to.eq(200)
            customers.forEach(({ industry: customerIndustry }) => {
              expect(customerIndustry).to.eq(industry)
            })
          })
      })
    })
  })

  describe('Filtros combinados', () => {
    it('retorna clientes filtrados por porte e setor ao mesmo tempo', () => {
      cy.request('GET', `${baseUrl}/customers?size=Medium&industry=Technology`)
        .then(({ status, body }) => {
          const { customers } = body
          expect(status).to.eq(200)
          customers.forEach(({ size, industry }) => {
            expect(size).to.eq('Medium')
            expect(industry).to.eq('Technology')
          })
        })
    })

    it('retorna a página correta ao combinar os filtros de porte, setor e paginação', () => {
      cy.request('GET', `${baseUrl}/customers?page=2&limit=10&size=Medium&industry=Technology`)
        .then(({ status, body }) => {
          const { customers, pageInfo } = body
          expect(status).to.eq(200)
          expect(pageInfo.currentPage).to.eq(2)
          customers.forEach(({ size, industry }) => {
            expect(size).to.eq('Medium')
            expect(industry).to.eq('Technology')
          })
        })
    })
  })

  describe('Estrutura dos dados do cliente', () => {
    it('retorna clientes com os campos esperados e nos tipos corretos', () => {
      cy.request('GET', `${baseUrl}/customers`)
        .then(({ body }) => {
          const { customers } = body
          customers.forEach(({ id, name, employees, size, industry }) => {
            expect(id).to.be.a('number')
            expect(name).to.be.a('string')
            expect(employees).to.be.a('number')
            expect(size).to.be.a('string')
            expect(industry).to.be.a('string')
          })
        })
    })

    it('retorna contactInfo como nulo ou como objeto com as chaves name e email', () => {
      cy.request('GET', `${baseUrl}/customers`)
        .then(({ body }) => {
          const { customers } = body
          customers.forEach(({ contactInfo }) => {
            if (contactInfo !== null) {
              expect(contactInfo).to.have.keys(['name', 'email'])
            } else {
              expect(contactInfo).to.be.null
            }
          })
        })
    })

    it('retorna address como nulo ou como objeto com as chaves esperadas', () => {
      cy.request('GET', `${baseUrl}/customers`)
        .then(({ body }) => {
          const { customers } = body
          customers.forEach(({ address }) => {
            if (address !== null) {
              expect(address).to.have.keys(['street', 'city', 'state', 'zipCode', 'country'])
            } else {
              expect(address).to.be.null
            }
          })
        })
    })

    it('atribui o porte correto com base na quantidade de funcionários', () => {
      cy.request('GET', `${baseUrl}/customers?limit=100`)
        .then(({ body }) => {
          const { customers } = body
          customers.forEach(({ employees, size }) => {
            if (employees < 100) expect(size).to.eq('Small')
            else if (employees < 1000) expect(size).to.eq('Medium')
            else if (employees < 10000) expect(size).to.eq('Enterprise')
            else if (employees < 50000) expect(size).to.eq('Large Enterprise')
            else expect(size).to.eq('Very Large Enterprise')
          })
        })
    })
  })

  describe('Parâmetros inválidos (400 Bad Request)', () => {
    it('retorna status 400 quando o parâmetro page é negativo', () => {
      cy.request({ method: 'GET', url: `${baseUrl}/customers?page=-1`, failOnStatusCode: false })
        .then(({ status }) => {
          expect(status).to.eq(400)
        })
    })

    it('retorna status 400 quando o parâmetro page não é um número', () => {
      cy.request({ method: 'GET', url: `${baseUrl}/customers?page=abc`, failOnStatusCode: false })
        .then(({ status }) => {
          expect(status).to.eq(400)
        })
    })

    it('retorna status 400 quando o parâmetro limit é negativo', () => {
      cy.request({ method: 'GET', url: `${baseUrl}/customers?limit=-5`, failOnStatusCode: false })
        .then(({ status }) => {
          expect(status).to.eq(400)
        })
    })

    it('retorna status 400 quando o parâmetro limit não é um número', () => {
      cy.request({ method: 'GET', url: `${baseUrl}/customers?limit=xyz`, failOnStatusCode: false })
        .then(({ status }) => {
          expect(status).to.eq(400)
        })
    })

    it('retorna status 400 quando o parâmetro size possui um valor não suportado', () => {
      cy.request({ method: 'GET', url: `${baseUrl}/customers?size=Huge`, failOnStatusCode: false })
        .then(({ status }) => {
          expect(status).to.eq(400)
        })
    })

    it('retorna status 400 quando o parâmetro industry possui um valor não suportado', () => {
      cy.request({ method: 'GET', url: `${baseUrl}/customers?industry=Healthcare`, failOnStatusCode: false })
        .then(({ status }) => {
          expect(status).to.eq(400)
        })
    })
  })
})