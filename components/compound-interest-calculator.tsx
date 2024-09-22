"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'
import { ArrowUpRight, DollarSign, Percent, Calendar } from "lucide-react"

type CalculationParams = {
  startingAmount: number
  rateOfReturn: number
  incrementalAddition: number
  incrementalFrequency: "monthly" | "quarterly" | "yearly"
  years: number
}

type CalculationResult = {
  year: number
  totalValue: number
  invested: number
  gained: number
}

function calculateCompoundInterest({
  startingAmount,
  rateOfReturn,
  incrementalAddition,
  incrementalFrequency,
  years
}: CalculationParams): CalculationResult[] {
  const results: CalculationResult[] = []
  let currentValue = startingAmount
  let totalInvested = startingAmount

  const frequencyMultiplier = 
    incrementalFrequency === "monthly" ? 12 : 
    incrementalFrequency === "quarterly" ? 4 : 1

  for (let year = 1; year <= years; year++) {
    currentValue *= (1 + rateOfReturn / 100)
    currentValue += incrementalAddition * frequencyMultiplier
    totalInvested += incrementalAddition * frequencyMultiplier

    results.push({
      year,
      totalValue: Number(currentValue.toFixed(2)),
      invested: Number(totalInvested.toFixed(2)),
      gained: Number((currentValue - totalInvested).toFixed(2))
    })
  }

  return results
}

export function CompoundInterestCalculatorComponent() {
  const [params1, setParams1] = useState<CalculationParams>({
    startingAmount: 100,
    rateOfReturn: 10,
    incrementalAddition: 505.75,
    incrementalFrequency: "monthly",
    years: 30
  })

  const [params2, setParams2] = useState<CalculationParams | null>(null)

  const [results1, setResults1] = useState<CalculationResult[]>([])
  const [results2, setResults2] = useState<CalculationResult[]>([])
  const [selectedPoint, setSelectedPoint] = useState<CalculationResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)

  const calculateResults = useCallback(() => {
    setResults1(calculateCompoundInterest(params1))
    if (isComparing && params2) {
      setResults2(calculateCompoundInterest(params2))
    }
  }, [params1, params2, isComparing])

  const handleCompare = () => {
    setIsComparing(true)
    setParams2({...params1})
  }

  const handleRemoveComparison = () => {
    setIsComparing(false)
    setParams2(null)
    setResults2([])
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointClick = (data: any) => {
    setSelectedPoint(data.payload)
  }

  useEffect(() => {
    calculateResults()
  }, [calculateResults])

  const chartData = useCallback(() => {
    const maxYears = Math.max(results1.length, results2.length)
    return Array.from({ length: maxYears }, (_, i) => ({
      year: i + 1,
      totalValue1: results1[i]?.totalValue || null,
      totalValue2: results2[i]?.totalValue || null
    }))
  }, [results1, results2])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, paramKey: keyof CalculationParams, calculatorNum: 1 | 2) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
    if (calculatorNum === 1) {
      setParams1(prev => ({ ...prev, [paramKey]: value }))
    } else if (params2) {
      setParams2(prev => ({ ...prev!, [paramKey]: value }))
    }
  }

  const getXAxisTicks = () => {
    const maxYears = Math.max(params1.years, params2?.years || 0)
    return Array.from({length: Math.floor(maxYears / 5) + 1}, (_, i) => i * 5)
  }

  const formatYAxisTick = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(0)}K`
    } else {
      return `$${value}`
    }
  }

  return (
    <div className="min-h-screen bg-[#e6e4dd] font-sans">
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-5xl font-extrabold text-center mb-8 text-black relative pt-4">
          <span className="text-black">
            Compound Interest Calculator
          </span>
          <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-black"></span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 lg:col-span-1 text-black font-bold bg-[#10b981] border-4 border-black shadow-[8px_8px_0_0_#000000]">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold">
                <DollarSign className="mr-2" />
                Calculator 1
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startingAmount1" className="text-lg font-semibold">Starting Amount ($)</Label>
                <Input
                  id="startingAmount1"
                  type="number"
                  value={params1.startingAmount || ''}
                  onChange={(e) => handleInputChange(e, 'startingAmount', 1)}
                  className="border-2 border-black text-lg p-3 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateOfReturn1" className="text-lg font-semibold">Rate of Return (APY %)</Label>
                <Input
                  id="rateOfReturn1"
                  type="number"
                  value={params1.rateOfReturn || ''}
                  onChange={(e) => handleInputChange(e, 'rateOfReturn', 1)}
                  className="border-2 border-black text-lg p-3 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incrementalAddition1" className="text-lg font-semibold">Incremental Addition ($)</Label>
                <Input
                  id="incrementalAddition1"
                  type="number"
                  value={params1.incrementalAddition || ''}
                  onChange={(e) => handleInputChange(e, 'incrementalAddition', 1)}
                  className="border-2 border-black text-lg p-3 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incrementalFrequency1" className="text-lg font-semibold">Incremental Frequency</Label>
                <Select
                  value={params1.incrementalFrequency}
                  onValueChange={(value: "monthly" | "quarterly" | "yearly") => setParams1(prev => ({ ...prev, incrementalFrequency: value }))}
                >
                  <SelectTrigger id="incrementalFrequency1" className="border-2 border-black text-lg p-3 bg-white">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="years1" className="text-lg font-semibold">Number of Years</Label>
                <Input
                  id="years1"
                  type="number"
                  value={params1.years || ''}
                  onChange={(e) => handleInputChange(e, 'years', 1)}
                  className="border-2 border-black text-lg p-3 bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {isComparing ? (
            <Card className="col-span-1 text-black font-bold md:col-span-2 lg:col-span-1 bg-[#eab308] border-4 border-black shadow-[8px_8px_0_0_#000000]">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold">
                  <DollarSign className="mr-2" />
                  Calculator 2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startingAmount2" className="text-lg font-semibold">Starting Amount ($)</Label>
                  <Input
                    id="startingAmount2"
                    type="number"
                    value={params2?.startingAmount || ''}
                    onChange={(e) => handleInputChange(e, 'startingAmount', 2)}
                    className="border-2 border-black text-lg p-3 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateOfReturn2" className="text-lg font-semibold">Rate of Return (APY %)</Label>
                  <Input
                    id="rateOfReturn2"
                    type="number"
                    value={params2?.rateOfReturn || ''}
                    onChange={(e) => handleInputChange(e, 'rateOfReturn', 2)}
                    className="border-2 border-black text-lg p-3 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incrementalAddition2" className="text-lg font-semibold">Incremental Addition ($)</Label>
                  <Input
                    id="incrementalAddition2"
                    type="number"
                    value={params2?.incrementalAddition || ''}
                    onChange={(e) => handleInputChange(e, 'incrementalAddition', 2)}
                    className="border-2 border-black text-lg p-3 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incrementalFrequency2" className="text-lg font-semibold">Incremental Frequency</Label>
                  <Select
                    value={params2?.incrementalFrequency}
                    onValueChange={(value: "monthly" | "quarterly" | "yearly") => setParams2(prev => prev ? { ...prev, incrementalFrequency: value } : null)}
                  >
                    <SelectTrigger id="incrementalFrequency2" className="border-2 border-black text-lg p-3 bg-white">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years2" className="text-lg font-semibold">Number of Years</Label>
                  <Input
                    id="years2"
                    type="number"
                    value={params2?.years || ''}
                    onChange={(e) => handleInputChange(e, 'years', 2)}
                    className="border-2 border-black text-lg p-3 bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#0d9488] border-4 border-black shadow-[8px_8px_0_0_#000000]">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-white">
                <Percent className="mr-2" />
                Final Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-white">
                Calculator 1: ${results1[results1.length - 1]?.totalValue.toLocaleString() ?? '0'}
              </div>
              {isComparing && (
                <div className="text-2xl font-bold text-white">
                  Calculator 2: ${results2[results2.length - 1]?.totalValue.toLocaleString() ?? '0'}
                </div>
              )}
              {isComparing ? (
                <Button onClick={handleRemoveComparison} size="lg" className="w-full text-xl font-bold bg-white text-black border-4 border-black hover:bg-[#eab308] hover:translate-y-1 transition-all">
                  Remove Comparison
                </Button>
              ) : (
                <Button onClick={handleCompare} size="lg" className="w-full text-lg font-bold bg-white text-black border-4 border-black hover:bg-[#eab308] hover:translate-y-1 transition-all">
                  <ArrowUpRight className="mr-2 h-4 w-4" /> Compare
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {results1.length > 0 && (
          <Card className="w-full text-black font-bold border-4 border-black shadow-[8px_8px_0_0_#000000]" style={{ backgroundColor: 'rgba(250,250,248,255)' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold">
                <Calendar className="mr-2" />
                Comparison Chart
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year"
                      tickFormatter={(value) => `${value}`}
                      tick={{ fontSize: 14, fill: '#000000' }}
                      ticks={getXAxisTicks()}
                      label={{ value: 'Year', position: 'insideBottomRight', offset: 3}}
                      height={44}
                    />
                    <YAxis 
                      tickFormatter={formatYAxisTick}
                      tick={{ fontSize: 16, fill: '#000000' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Value']}
                      labelFormatter={(label) => `Year ${label}`}
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #000000' }}
                    />
                      <Legend verticalAlign="bottom" height={36} />
                    <Line 
                      type="monotone" 
                      dataKey="totalValue1" 
                      name="Calculator 1"
                      stroke="#10b981" 
                      strokeWidth={3}
                      activeDot={{ r: 8, onClick: handlePointClick }}
                      connectNulls
                    />
                    {isComparing && (
                      <Line 
                        type="monotone" 
                        dataKey="totalValue2" 
                        name="Calculator 2"
                        stroke="#eab308" 
                        strokeWidth={3}
                        activeDot={{ r: 8, onClick: handlePointClick }}
                        connectNulls
                      />
                    )}
                    {selectedPoint && (
                      <>
                        <ReferenceLine x={selectedPoint.year} stroke="#0000FF" strokeDasharray="3 3" />
                        <ReferenceLine y={selectedPoint.totalValue} stroke="#0000FF" strokeDasharray="3 3" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedPoint && (
          <Card className="w-full text-black bg-[#0d9488] border-4 border-black shadow-[8px_8px_0_0_#000000]">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-white">
                <ArrowUpRight className="mr-2" />
                Selected Year Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Year</h3>
                <p className="text-2xl font-bold text-white">{selectedPoint.year}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Calculator 1 Total Value</h3>
                <p className="text-2xl font-bold text-white">${selectedPoint.totalValue?.toLocaleString() ?? 'N/A'}</p>
              </div>
              {isComparing && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Calculator 2 Total Value</h3>
                  <p className="text-2xl font-bold text-white">${selectedPoint.totalValue?.toLocaleString() ?? 'N/A'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}