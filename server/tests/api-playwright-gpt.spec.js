import { test, expect } from '@playwright/test'

test.describe('GET /customers', () => {
  const apiUrl = 'http://localhost:3001'

  test.describe('Requisições com sucesso', () => {
    test('retorna clientes utilizando os valores padrão das query strings', async ({ request }) => {
      // Arrange

      // Act
      const response = await request.get(`${apiUrl}/customers`)

      const status = response.status()
      const body = await response.json()

      const { customers, pageInfo } = body
      const [customer] = customers

      // Assert
      expect(status).toBe(200)

      expect(Array.isArray(customers)).toBeTruthy()
      expect(customers.length).toBeLessThanOrEqual(10)

      expect(customer).toHaveProperty('id')
      expect(customer).toHaveProperty('name')
      expect(customer).toHaveProperty('employees')
      expect(customer).toHaveProperty('industry')
      expect(customer).toHaveProperty('contactInfo')
      expect(customer).toHaveProperty('address')
      expect(customer).toHaveProperty('size')

      expect(typeof customer.id).toBe('number')
      expect(typeof customer.name).toBe('string')
      expect(typeof customer.employees).toBe('number')
      expect(typeof customer.industry).toBe('string')
      expect(typeof customer.size).toBe('string')

      if (customer.contactInfo) {
        expect(typeof customer.contactInfo.name).toBe('string')
        expect(typeof customer.contactInfo.email).toBe('string')
      }

      if (customer.address) {
        expect(typeof customer.address.street).toBe('string')
        expect(typeof customer.address.city).toBe('string')
        expect(typeof customer.address.state).toBe('string')
        expect(typeof customer.address.zipCode).toBe('string')
        expect(typeof customer.address.country).toBe('string')
      }

      expect(pageInfo.currentPage).toBe(1)
      expect(typeof pageInfo.totalPages).toBe('number')
      expect(typeof pageInfo.totalCustomers).toBe('number')
    })

    test('retorna clientes da página solicitada', async ({ request }) => {
      // Arrange
      const page = 2

      // Act
      const response = await request.get(
        `${apiUrl}/customers?page=${page}`
      )

      const status = response.status()
      const body = await response.json()

      const { pageInfo } = body

      // Assert
      expect(status).toBe(200)
      expect(pageInfo.currentPage).toBe(page)
    })

    test('retorna a quantidade solicitada de clientes por página', async ({ request }) => {
      // Arrange
      const limit = 5

      // Act
      const response = await request.get(
        `${apiUrl}/customers?limit=${limit}`
      )

      const status = response.status()
      const body = await response.json()

      const { customers } = body

      // Assert
      expect(status).toBe(200)
      expect(customers).toHaveLength(limit)
    })

    test('retorna apenas clientes do tipo Medium', async ({ request }) => {
      // Arrange
      const size = 'Medium'

      // Act
      const response = await request.get(
        `${apiUrl}/customers?size=${size}`
      )

      const status = response.status()
      const body = await response.json()

      const { customers } = body

      // Assert
      expect(status).toBe(200)

      customers.forEach(({ size, employees }) => {
        expect(size).toBe('Medium')
        expect(employees).toBeGreaterThanOrEqual(100)
        expect(employees).toBeLessThanOrEqual(999)
      })
    })

    test('retorna apenas clientes do tipo Enterprise', async ({ request }) => {
      // Arrange
      const size = 'Enterprise'

      // Act
      const response = await request.get(
        `${apiUrl}/customers?size=${size}`
      )

      const status = response.status()
      const body = await response.json()

      const { customers } = body

      // Assert
      expect(status).toBe(200)

      customers.forEach(({ size, employees }) => {
        expect(size).toBe('Enterprise')
        expect(employees).toBeGreaterThanOrEqual(1000)
        expect(employees).toBeLessThanOrEqual(9999)
      })
    })

    test('retorna apenas clientes da indústria Technology', async ({ request }) => {
      // Arrange
      const industry = 'Technology'

      // Act
      const response = await request.get(
        `${apiUrl}/customers?industry=${industry}`
      )

      const status = response.status()
      const body = await response.json()

      const { customers } = body

      // Assert
      expect(status).toBe(200)

      customers.forEach(customer => {
        expect(customer.industry).toBe(industry)
      })
    })

    test('retorna apenas clientes do tipo Medium da indústria Retail', async ({ request }) => {
      // Arrange
      const size = 'Medium'
      const industry = 'Retail'

      // Act
      const response = await request.get(
        `${apiUrl}/customers?size=${size}&industry=${industry}`
      )

      const status = response.status()
      const body = await response.json()

      const { customers } = body

      // Assert
      expect(status).toBe(200)

      customers.forEach(customer => {
        expect(customer.size).toBe(size)
        expect(customer.industry).toBe(industry)
        expect(customer.employees).toBeGreaterThanOrEqual(100)
        expect(customer.employees).toBeLessThanOrEqual(999)
      })
    })
  })

  test.describe('Requisições inválidas', () => {
    test('retorna erro quando page é igual a 0', async ({ request }) => {
      // Arrange
      const page = 0

      // Act
      const response = await request.get(
        `${apiUrl}/customers?page=${page}`
      )

      const status = response.status()
      const body = await response.json()

      const { error } = body

      // Assert
      expect(status).toBe(400)
      expect(error).toBe(
        'Invalid page or limit. Both must be positive numbers.'
      )
    })

    test('retorna erro quando page é negativo', async ({ request }) => {
      // Arrange
      const page = -1

      // Act
      const response = await request.get(
        `${apiUrl}/customers?page=${page}`
      )

      const status = response.status()
      const body = await response.json()

      const { error } = body

      // Assert
      expect(status).toBe(400)
      expect(error).toBe(
        'Invalid page or limit. Both must be positive numbers.'
      )
    })

    test('retorna erro quando limit é igual a 0', async ({ request }) => {
      // Arrange
      const limit = 0

      // Act
      const response = await request.get(
        `${apiUrl}/customers?limit=${limit}`
      )

      const status = response.status()
      const body = await response.json()

      const { error } = body

      // Assert
      expect(status).toBe(400)
      expect(error).toBe(
        'Invalid page or limit. Both must be positive numbers.'
      )
    })

    test('retorna erro quando limit é negativo', async ({ request }) => {
      // Arrange
      const limit = -1

      // Act
      const response = await request.get(
        `${apiUrl}/customers?limit=${limit}`
      )

      const status = response.status()
      const body = await response.json()

      const { error } = body

      // Assert
      expect(status).toBe(400)
      expect(error).toBe(
        'Invalid page or limit. Both must be positive numbers.'
      )
    })

    test('retorna erro quando size não é suportado', async ({ request }) => {
      // Arrange
      const size = 'Startup'

      // Act
      const response = await request.get(
        `${apiUrl}/customers?size=${size}`
      )

      const status = response.status()
      const body = await response.json()

      const { error } = body

      // Assert
      expect(status).toBe(400)
      expect(error).toBe(
        'Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.'
      )
    })

    test('retorna erro quando industry não é suportado', async ({ request }) => {
      // Arrange
      const industry = 'Healthcare'

      // Act
      const response = await request.get(
        `${apiUrl}/customers?industry=${industry}`
      )

      const status = response.status()
      const body = await response.json()

      const { error } = body

      // Assert
      expect(status).toBe(400)
      expect(error).toBe(
        'Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.'
      )
    })
  })
})