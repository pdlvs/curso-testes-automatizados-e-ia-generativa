describe('Testes da API de Clientes - GET /customers', () => {
  const baseUrl = 'http://localhost:3001/customers'

  context('Fluxos de Sucesso (200 OK)', () => {

    it('Deve retornar a lista de clientes com os parâmetros padrões (Página 1, Limite 10)', () => {
      cy.request({
        method: 'GET',
        url: baseUrl
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('customers')
        expect(response.body).to.have.property('pageInfo')
        
        // Valida paginação padrão
        expect(response.body.pageInfo.currentPage).to.eq(1)
        expect(response.body.customers).to.have.lengthOf.at.most(10)
      })
    })

    it('Deve filtrar clientes corretamente por página, limite, tamanho e indústria', () => {
      const params = {
        page: 2,
        limit: 10,
        size: 'Medium',
        industry: 'Technology'
      }

      cy.request({
        method: 'GET',
        url: baseUrl,
        qs: params // Passa os query parameters
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.pageInfo.currentPage).to.eq(2)
        
        // Valida se todos os clientes retornados atendem aos filtros aplicados
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.eq('Medium')
          expect(customer.industry).to.contain('Technology') // Ignorando case se necessário, ou correspondência exata
          
          // Valida a regra de negócio do tamanho 'Medium' (entre 100 e 999 funcionários)
          expect(customer.employees).to.be.gte(100)
          expect(customer.employees).to.be.lessThan(1000)
        })
      })
    })

    it('Deve validar a estrutura de dados (schema) do corpo da resposta', () => {
      cy.request('GET', baseUrl).then((response) => {
        const { customers, pageInfo } = response.body

        // Valida estrutura do pageInfo
        expect(pageInfo).to.have.all.keys('currentPage', 'totalPages', 'totalCustomers')
        expect(pageInfo.currentPage).to.be.a('number')
        expect(pageInfo.totalPages).to.be.a('number')
        expect(pageInfo.totalCustomers).to.be.a('number')

        // Valida estrutura do primeiro cliente (se houver)
        if (customers.length > 0) {
          const firstCustomer = customers[0]
          expect(firstCustomer).to.have.property('id').and.be.a('number')
          expect(firstCustomer).to.have.property('name').and.be.a('string')
          expect(firstCustomer).to.have.property('employees').and.be.a('number')
          expect(firstCustomer).to.have.property('size').and.be.a('string')
          expect(firstCustomer).to.have.property('industry').and.be.a('string')
          
          // Propriedades que podem ser nulas (contactInfo e address)
          expect(firstCustomer).to.have.property('contactInfo')
          if (firstCustomer.contactInfo !== null) {
            expect(firstCustomer.contactInfo).to.have.all.keys('name', 'email')
          }

          expect(firstCustomer).to.have.property('address')
          if (firstCustomer.address !== null) {
            expect(firstCustomer.address).to.have.all.keys('street', 'city', 'state', 'zipCode', 'country')
          }
        }
      })
    })
  })

  context('Fluxos de Erro (400 Bad Request)', () => {

    // Array de cenários inválidos para rodar em loop
    const cenariosInvalidos = [
      { nome: 'página negativa', params: { page: -1 } },
      { nome: 'página não numérica', params: { page: 'dois' } },
      { nome: 'limite negativo', params: { limit: -5 } },
      { nome: 'limite não númerico', params: { limit: 'dez' } },
      { nome: 'tamanho (size) inválido', params: { size: 'SuperBig' } },
      { nome: 'indústria (industry) inválida', params: { industry: 'Gaming' } }
    ]

    cenariosInvalidos.forEach((cenario) => {
      it(`Deve retornar 400 Bad Request para query param inválido: ${cenario.nome}`, () => {
        cy.request({
          method: 'GET',
          url: baseUrl,
          qs: cenario.params,
          failOnStatusCode: false // Impede o Cypress de falhar o teste automaticamente no erro 400
        }).then((response) => {
          expect(response.status).to.eq(400)
        })
      })
    })
  })
})