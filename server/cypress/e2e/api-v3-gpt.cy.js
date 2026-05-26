describe('GET /customers', () => {
  const apiUrl = Cypress.env('apiUrl')

  context('Requisições com sucesso', () => {
    it('retorna clientes utilizando os valores padrão das query strings', () => {
      // Arrange

      // Act
      cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
        const { customers, pageInfo } = body
        const [customer] = customers

        // Assert
        expect(status).to.eq(200)

        expect(customers).to.be.an('array')
        expect(customers.length).to.be.at.most(10)

        expect(customer).to.have.all.keys(
          'id',
          'name',
          'employees',
          'industry',
          'contactInfo',
          'address',
          'size'
        )

        expect(customer.id).to.be.a('number')
        expect(customer.name).to.be.a('string')
        expect(customer.employees).to.be.a('number')
        expect(customer.industry).to.be.a('string')
        expect(customer.size).to.be.a('string')

        if (customer.contactInfo) {
          expect(customer.contactInfo.name).to.be.a('string')
          expect(customer.contactInfo.email).to.be.a('string')
        }

        if (customer.address) {
          expect(customer.address.street).to.be.a('string')
          expect(customer.address.city).to.be.a('string')
          expect(customer.address.state).to.be.a('string')
          expect(customer.address.zipCode).to.be.a('string')
          expect(customer.address.country).to.be.a('string')
        }

        expect(pageInfo.currentPage).to.eq(1)
        expect(pageInfo.totalPages).to.be.a('number')
        expect(pageInfo.totalCustomers).to.be.a('number')
      })
    })

    it('retorna clientes da página solicitada', () => {
      // Arrange
      const page = 2

      // Act
      cy.request('GET', `${apiUrl}/customers?page=${page}`).then(({ status, body }) => {
        const { pageInfo } = body

        // Assert
        expect(status).to.eq(200)
        expect(pageInfo.currentPage).to.eq(page)
      })
    })

    it('retorna a quantidade solicitada de clientes por página', () => {
      // Arrange
      const limit = 5

      // Act
      cy.request('GET', `${apiUrl}/customers?limit=${limit}`).then(({ status, body }) => {
        const { customers } = body

        // Assert
        expect(status).to.eq(200)
        expect(customers).to.have.length(limit)
      })
    })

    it('retorna apenas clientes do tipo Medium', () => {
      // Arrange
      const size = 'Medium'

      // Act
      cy.request('GET', `${apiUrl}/customers?size=${size}`).then(({ status, body }) => {
        const { customers } = body

        // Assert
        expect(status).to.eq(200)

        customers.forEach(({ size, employees }) => {
          expect(size).to.eq('Medium')
          expect(employees).to.be.at.least(100)
          expect(employees).to.be.at.most(999)
        })
      })
    })

    it('retorna apenas clientes do tipo Enterprise', () => {
      // Arrange
      const size = 'Enterprise'

      // Act
      cy.request('GET', `${apiUrl}/customers?size=${size}`).then(({ status, body }) => {
        const { customers } = body

        // Assert
        expect(status).to.eq(200)

        customers.forEach(({ size, employees }) => {
          expect(size).to.eq('Enterprise')
          expect(employees).to.be.at.least(1000)
          expect(employees).to.be.at.most(9999)
        })
      })
    })

    it('retorna apenas clientes da indústria Technology', () => {
      // Arrange
      const industry = 'Technology'

      // Act
      cy.request('GET', `${apiUrl}/customers?industry=${industry}`).then(({ status, body }) => {
        const { customers } = body

        // Assert
        expect(status).to.eq(200)

        customers.forEach(customer => {
          expect(customer.industry).to.eq(industry)
        })
      })
    })

    it('retorna apenas clientes do tipo Medium da indústria Retail', () => {
      // Arrange
      const size = 'Medium'
      const industry = 'Retail'

      // Act
      cy.request(
        'GET',
        `${apiUrl}/customers?size=${size}&industry=${industry}`
      ).then(({ status, body }) => {
        const { customers } = body

        // Assert
        expect(status).to.eq(200)

        customers.forEach(customer => {
          expect(customer.size).to.eq(size)
          expect(customer.industry).to.eq(industry)
          expect(customer.employees).to.be.at.least(100)
          expect(customer.employees).to.be.at.most(999)
        })
      })
    })
  })

  context('Requisições inválidas', () => {
    it('retorna erro quando page é igual a 0', () => {
      // Arrange
      const page = 0

      // Act
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?page=${page}`,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        const { error } = body

        // Assert
        expect(status).to.eq(400)
        expect(error).to.eq(
          'Invalid page or limit. Both must be positive numbers.'
        )
      })
    })

    it('retorna erro quando page é negativo', () => {
      // Arrange
      const page = -1

      // Act
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?page=${page}`,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        const { error } = body

        // Assert
        expect(status).to.eq(400)
        expect(error).to.eq(
          'Invalid page or limit. Both must be positive numbers.'
        )
      })
    })

    it('retorna erro quando limit é igual a 0', () => {
      // Arrange
      const limit = 0

      // Act
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?limit=${limit}`,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        const { error } = body

        // Assert
        expect(status).to.eq(400)
        expect(error).to.eq(
          'Invalid page or limit. Both must be positive numbers.'
        )
      })
    })

    it('retorna erro quando limit é negativo', () => {
      // Arrange
      const limit = -1

      // Act
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?limit=${limit}`,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        const { error } = body

        // Assert
        expect(status).to.eq(400)
        expect(error).to.eq(
          'Invalid page or limit. Both must be positive numbers.'
        )
      })
    })

    it('retorna erro quando size não é suportado', () => {
      // Arrange
      const size = 'Startup'

      // Act
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?size=${size}`,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        const { error } = body

        // Assert
        expect(status).to.eq(400)
        expect(error).to.eq(
          'Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.'
        )
      })
    })

    it('retorna erro quando industry não é suportado', () => {
      // Arrange
      const industry = 'Healthcare'

      // Act
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?industry=${industry}`,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        const { error } = body

        // Assert
        expect(status).to.eq(400)
        expect(error).to.eq(
          'Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.'
        )
      })
    })
  })
})