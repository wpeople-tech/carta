interface Props {
  text: string
}

export default function CartaCall({ text }: Props) {
  return (
    <div className="carta-call">
      <div className="carta-call-label">CARTA's Call</div>
      <p className="carta-call-text">{text}</p>
    </div>
  )
}
